// Pure functions: ALL money math lives here, never in the LLM.

// Verify current Indian GST slabs for accommodation before launch; edit here only.
const GST = { slabLimit: 7500, low: 0.05, high: 0.18 };
const SERVICE_FEE_RATE = 0.10; // your platform's fee

// How a trip budget is split. Stay gets the biggest share.
const SPLIT = { stay: 0.4, food: 0.25, transport: 0.2, activities: 0.15 };

function splitBudget(total) {
  const out = {};
  for (const [k, v] of Object.entries(SPLIT)) out[k] = Math.round(total * v);
  return out;
}

// Full, transparent stay price (no surprises).
function stayCost(listing, nights) {
  const base = listing.price * nights;
  const cleaning = listing.cleaningFee ?? 0;
  const service = Math.round(base * SERVICE_FEE_RATE);
  const gstRate = listing.price <= GST.slabLimit ? GST.low : GST.high;
  const gst = Math.round(base * gstRate);
  return { base, cleaning, service, gst, total: base + cleaning + service + gst };
}

// Highest nightly price that can still fit inside the stay budget (optimistic bound for DB filter;
// exact check happens with stayCost afterwards).
function maxNightlyPrice(stayBudget, nights) {
  const factor = 1 + SERVICE_FEE_RATE + GST.low;
  return Math.floor(stayBudget / (nights * factor));
}

// Higher = better. Rewards rating and leaving room in the budget.
function valueScore(listing, cost, stayBudget) {
  const rating = (listing.avgRating ?? 4) / 5;
  const headroom = Math.max(0, 1 - cost.total / stayBudget);
  return +(rating * 0.6 + headroom * 0.4).toFixed(3);
}

function activitiesCost(activities, guests) {
  return activities.reduce((s, a) => s + a.costPerPerson * guests, 0);
}

module.exports = { splitBudget, stayCost, maxNightlyPrice, valueScore, activitiesCost, SPLIT };
