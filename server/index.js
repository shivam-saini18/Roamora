require("dotenv").config();
const express = require("express"), mongoose = require("mongoose"), cookieParser = require("cookie-parser");
const cors = require("cors"), helmet = require("helmet"), jwt = require("jsonwebtoken");
if (!process.env.JWT_SECRET || !process.env.MONGO_URL) throw new Error("Copy .env.example to .env and fill it in");
const app = express();
app.use(helmet(), cors({ origin: process.env.CLIENT_URL, credentials: true }), express.json(), cookieParser());
// soft auth: sets req.userId when a valid cookie exists
app.use((req, res, next) => { try { req.userId = jwt.verify(req.cookies.token, process.env.JWT_SECRET).id; } catch {} next(); });
app.use("/api", require("./routes"));
app.use("/api/copilot", require("./routes/copilot"));
app.use((e, req, res, next) => res.status(e.status || 500).json({ error: e.message || "Server error" }));
mongoose.connect(process.env.MONGO_URL).then(() => app.listen(process.env.PORT || 8080, () => console.log("API running")));
