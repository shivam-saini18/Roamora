const express = require("express");
const rateLimit = require("express-rate-limit");
const { planTrip } = require("../services/copilot");
const TripPlan = require("../models/TripPlan");

const router = express.Router();
// AI calls cost money: limit per IP.
router.use(rateLimit({ windowMs: 60 * 60 * 1000, max: 10 }));

router.post("/plan", async (req, res, next) => {
  try {
    const prompt = String(req.body.prompt || "").trim().slice(0, 500);
    if (prompt.length < 10) return res.status(400).json({ error: "Describe your trip a bit more." });
    const plan = await planTrip(prompt);
    await TripPlan.create({ user: req.userId, prompt, request: plan.request, plan });
    res.json(plan);
  } catch (e) { next(e); }
});

module.exports = router;
// app.js:  app.use("/api/copilot", require("./routes/copilot"));
