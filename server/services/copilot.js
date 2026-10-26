const Listing = require("../models").Listing; // your existing model (add avgRating, maxGuests, cleaningFee)
const Activity = require("../models/Activity");
const { splitBudget, stayCost, maxNightlyPrice, valueScore, activitiesCost } = require("./budget");

const { parseFree, freeItinerary, freeWhy } = require("./freeplanner");
const KEY = process.env.ANTHROPIC_API_KEY || "";
const useAI = KEY.startsWith("sk-ant-") && KEY.length > 60; // placeholder keys are ignored
const client = useAI ? new (require("@anthropic-ai/sdk"))({ apiKey: KEY }) : null;
const MODEL = "claude-sonnet-5-5";

// Force structured output by making the model call a tool.
async function callTool(system, user, tool) {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system,
    tools: [tool],
    tool_choice: { type: "tool", name: tool.name },
    messages: [{ role: "user", content: user }],
  });
  const block = res.content.find((b) => b.type === "tool_use");
  if (!block) throw new Error("Model returned no structured output");
  return block.input;
}

// STEP 1: turn free text into a structured request.
async function parseRequest(prompt) {
  const req = await callTool(
    "Extract trip parameters from the user's message. Never guess a budget; omit what is not stated.",
    prompt,
    {
      name: "trip_request",
      description: "Structured trip request",
      input_schema: {
        type: "object",
        properties: {
          destination: { type: "string" },
          days: { type: "integer", minimum: 1, maximum: 14 },
          budget: { type: "number", description: "Total INR for the whole trip" },
          guests: { type: "integer", minimum: 1 },
          interests: { type: "array", items: { type: "string" } },
        },
        required: ["destination", "days", "budget", "guests"],
      },
    }
  );
  req.nights = Math.max(1, req.days - 1);
  return req;
}

// STEP 2: real stays from MongoDB, priced and ranked in code.
async function findStays(req, budgets) {
  const rx = new RegExp(req.destination, "i");
  const candidates = await Listing.find({
    $or: [{ location: rx }, { title: rx }],
    price: { $lte: maxNightlyPrice(budgets.stay, req.nights) },
  }).limit(30).lean();

  return candidates
    .filter((l) => (l.maxGuests ?? 4) >= req.guests)
    .map((l) => {
      const cost = stayCost(l, req.nights);
      return { listing: l, cost, score: valueScore(l, cost, budgets.stay) };
    })
    .filter((s) => s.cost.total <= budgets.stay)   // exact budget check
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

// STEP 3: LLM chooses ONLY from real activities; prices come from DB, not the model.
async function buildItinerary(req, stays, activities, budgets) {
  const catalog = activities.map((a) => ({
    id: String(a._id), name: a.name, category: a.category,
    hours: a.durationHours, costPerPerson: a.costPerPerson,
  }));
  const plan = await callTool(
    `You are a trip planner. Use ONLY activity ids from the catalog. Max 3 activities per day,
keep the total activity cost per person within ${Math.round(budgets.activities / req.guests)} INR.
Never state prices yourself; the system adds them. Write short, friendly notes.`,
    JSON.stringify({ request: req, activityCatalog: catalog }),
    {
      name: "itinerary",
      description: "Day-by-day plan",
      input_schema: {
        type: "object",
        properties: {
          days: {
            type: "array",
            items: {
              type: "object",
              properties: {
                day: { type: "integer" },
                theme: { type: "string" },
                activityIds: { type: "array", items: { type: "string" } },
                note: { type: "string" },
              },
              required: ["day", "theme", "activityIds"],
            },
          },
        },
        required: ["days"],
      },
    }
  );

  const byId = new Map(catalog.map((a) => [a.id, a]));
  // Drop any hallucinated ids, then price everything from real data.
  const days = plan.days.map((d) => {
    const acts = d.activityIds.map((id) => byId.get(id)).filter(Boolean);
    return { ...d, activities: acts, dayCost: activitiesCost(acts, req.guests) };
  });
  return days;
}

// STEP 4: explanations use real numbers computed above.
async function explainStays(req, stays, budgets) {
  const facts = stays.map((s) => ({
    id: String(s.listing._id), title: s.listing.title,
    nightly: s.listing.price, total: s.cost.total,
    pctOfStayBudget: Math.round((s.cost.total / budgets.stay) * 100),
    rating: s.listing.avgRating ?? null,
  }));
  const out = await callTool(
    "For each stay write ONE sentence on why it fits this traveler's budget. Use only the given facts.",
    JSON.stringify({ request: req, stays: facts }),
    {
      name: "explanations",
      description: "Why each stay fits",
      input_schema: {
        type: "object",
        properties: {
          items: { type: "array", items: { type: "object",
            properties: { id: { type: "string" }, why: { type: "string" } },
            required: ["id", "why"] } },
        },
        required: ["items"],
      },
    }
  );
  return new Map(out.items.map((i) => [i.id, i.why]));
}

async function planTrip(prompt) {
  const places = await Activity.distinct("destination");
  let mode = "ai", req;
  try { if (!useAI) throw new Error("no key"); req = await parseRequest(prompt); }
  catch { mode = "free"; req = parseFree(prompt, places); }
  const budgets = splitBudget(req.budget);

  const stays = await findStays(req, budgets);
  if (!stays.length) {
    return { request: req, budgets, stays: [], mode, message:
      `No ${req.destination} stays fit ₹${budgets.stay.toLocaleString("en-IN")} for ${req.nights} night(s). Try a higher budget or fewer guests.` };
  }

  const activities = await Activity.find({ destination: new RegExp(req.destination, "i") }).lean();
  let days, why;
  if (mode === "ai") {
    try { [days, why] = await Promise.all([buildItinerary(req, stays, activities, budgets), explainStays(req, stays, budgets)]); }
    catch { mode = "free"; }
  }
  if (mode === "free") { days = freeItinerary(req, activities, budgets); why = freeWhy(req, stays, budgets); }

  const best = stays[0];
  const activityTotal = days.reduce((s, d) => s + d.dayCost, 0);
  const estimate = {
    stay: best.cost.total,
    activities: activityTotal,
    food: Math.min(budgets.food, 500 * req.guests * req.days),
    transport: Math.min(budgets.transport, 600 * req.days),
  };
  estimate.total = Object.values(estimate).reduce((a, b) => a + b, 0);

  return {
    request: req, budgets, mode,
    stays: stays.map((s) => ({
      listingId: s.listing._id, title: s.listing.title, image: s.listing.image, images: (s.listing.images || []).slice(0, 5),
      cost: s.cost, why: why.get(String(s.listing._id)) || "",
    })),
    itinerary: days, estimate,
    withinBudget: estimate.total <= req.budget,
    remaining: req.budget - estimate.total,
  };
}

module.exports = { planTrip };
