const mongoose = require("mongoose");
const tripPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  prompt: String,
  request: Object,   // parsed {destination, days, budget, guests, interests}
  plan: Object,      // full response: stays, itinerary, costs
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("TripPlan", tripPlanSchema);
