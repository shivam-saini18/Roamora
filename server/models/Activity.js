const mongoose = require("mongoose");
// Seed this yourself per destination (real prices!). The LLM may only pick from here.
const activitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  destination: { type: String, required: true, index: true }, // e.g. "Manali"
  category: String,            // adventure | sightseeing | culture | relax | food
  costPerPerson: { type: Number, required: true }, // INR
  durationHours: { type: Number, default: 2 },
  bestSeason: [String],
  description: String,
});
module.exports = mongoose.model("Activity", activitySchema);
