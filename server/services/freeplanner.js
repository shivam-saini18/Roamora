// Free mode: no AI, no API key. Plain rules that parse the request and build the plan.
const W = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8 };
const n = (s) => W[String(s).toLowerCase()] ?? parseFloat(String(s).replace(/,/g, ""));
const NUM = "(\\d+|one|two|three|four|five|six|seven|eight)";
const THEME = { adventure: "Adventure day", culture: "Culture and sights", sightseeing: "Sights and views", relax: "Slow and relaxed", food: "Food and cafes" };

function parseFree(prompt, places = []) {
  const t = prompt.toLowerCase();
  let days = 3;
  const d = t.match(new RegExp(NUM + "\\s*-?\\s*(day|night)s?"));
  if (d) days = n(d[1]) + (d[2] === "night" ? 1 : 0);
  else if (t.includes("weekend")) days = 2;
  let b = t.match(/(?:under|below|within|upto|up to|max|budget(?: of)?)\s*(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*(k|thousand|lakh)?/)
       || t.match(/(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)\s*(k|thousand|lakh)?/);
  if (!b) { const e = new Error("Include a budget, for example: under ₹12,000."); e.status = 400; throw e; }
  const mult = { k: 1e3, thousand: 1e3, lakh: 1e5 }[b[2]] || 1;
  const budget = Math.round(n(b[1]) * mult);
  let guests = 1;
  const g = t.match(new RegExp(NUM + "\\s*(?:people|persons?|guests?|adults?|friends|travell?ers|of us)")) || t.match(new RegExp("for\\s+" + NUM + "\\b"));
  if (g) guests = n(g[1]); else if (/couple|honeymoon/.test(t)) guests = 2;
  const destination = places.find((p) => t.includes(p.toLowerCase()));
  if (!destination) { const e = new Error(`I can plan trips for: ${places.join(", ") || "no destinations yet"}.`); e.status = 400; throw e; }
  const interests = ["adventure", "relax", "food", "culture", "sightseeing"].filter((k) => t.includes(k));
  if (/trek|snow|ski|paraglid/.test(t) && !interests.includes("adventure")) interests.push("adventure");
  return { destination, days, nights: Math.max(1, days - 1), budget, guests, interests };
}

function freeItinerary(req, activities, budgets) {
  const cap = Math.floor(budgets.activities / req.guests);
  const want = (a) => (req.interests.includes(a.category) ? 0 : 1);
  const pool = [...activities].sort((a, b) => want(a) - want(b) || a.costPerPerson - b.costPerPerson);
  const picked = []; let spent = 0;
  for (const a of pool) {
    if (picked.length >= req.days * 3 || spent + a.costPerPerson > cap) continue;
    picked.push(a); spent += a.costPerPerson;
  }
  const days = Array.from({ length: req.days }, (_, i) => ({ day: i + 1, activities: [] }));
  picked.forEach((a, i) => days[i % req.days].activities.push({ id: String(a._id), name: a.name, category: a.category, hours: a.durationHours, costPerPerson: a.costPerPerson }));
  return days.map((d) => ({
    ...d, theme: d.activities.length ? THEME[d.activities[0].category] || "Explore" : "Free day to relax",
    dayCost: d.activities.reduce((s, a) => s + a.costPerPerson * req.guests, 0), note: "",
  }));
}

function freeWhy(req, stays, budgets) {
  return new Map(stays.map((s) => {
    const pct = Math.round((s.cost.total / budgets.stay) * 100), left = budgets.stay - s.cost.total;
    return [String(s.listing._id), `Costs ₹${s.cost.total.toLocaleString("en-IN")} for ${req.nights} night(s), which is ${pct}% of your ₹${budgets.stay.toLocaleString("en-IN")} stay budget${left > 0 ? `, leaving ₹${left.toLocaleString("en-IN")} spare` : ""}. Fits ${req.guests} guest(s).`];
  }));
}
module.exports = { parseFree, freeItinerary, freeWhy };
