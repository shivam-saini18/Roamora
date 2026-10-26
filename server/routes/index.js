const r = require("express").Router(), bcrypt = require("bcryptjs"), jwt = require("jsonwebtoken");
const { User, Listing, Booking, Review } = require("../models");
const { stayCost } = require("../services/budget");
const fail = (s, m) => Object.assign(new Error(m), { status: s });
const wrap = (f) => (q, s, n) => f(q, s, n).catch(n);
const auth = (q, s, n) => (q.userId ? n() : n(fail(401, "Please log in first")));
const login = (s, u) => s.cookie("token", jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: "7d" }), { httpOnly: true, sameSite: "lax", maxAge: 6048e5 });
const pub = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role, wishlist: u.wishlist });

// ---- auth
r.post("/auth/signup", wrap(async (q, s) => {
  const { name, email, password, role } = q.body;
  if (!name || !email || !password || password.length < 6) throw fail(400, "Name, email and a password of 6+ characters are required");
  if (await User.exists({ email: email.toLowerCase() })) throw fail(409, "This email is already registered");
  const u = await User.create({ name, email, password: await bcrypt.hash(password, 10), role: role === "host" ? "host" : "guest" });
  login(s, u); s.json(pub(u));
}));
r.post("/auth/login", wrap(async (q, s) => {
  const u = await User.findOne({ email: (q.body.email || "").toLowerCase() });
  if (!u || !(await bcrypt.compare(q.body.password || "", u.password))) throw fail(401, "Wrong email or password");
  login(s, u); s.json(pub(u));
}));
r.post("/auth/logout", (q, s) => s.clearCookie("token").json({ ok: true }));
r.get("/auth/me", auth, wrap(async (q, s) => s.json(pub(await User.findById(q.userId)))));

// ---- listings: category, search, sort, guests
r.get("/listings", wrap(async (q, s) => {
  const { category, search, sort, guests } = q.query, f = {};
  if (category && category !== "All") f.category = category;
  if (search) { const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"); f.$or = [{ title: rx }, { location: rx }, { place: rx }, { country: rx }]; }
  if (guests) f.maxGuests = { $gte: +guests };
  const order = { price_asc: { price: 1 }, price_desc: { price: -1 } }[sort] || { createdAt: -1 };
  const list = await Listing.find(f).sort(order).lean();
  s.json(list.map((l) => ({ ...l, priceWithTaxes: stayCost({ ...l, cleaningFee: 0 }, 1).total })));
}));
r.get("/listings/:id", wrap(async (q, s) => {
  const l = await Listing.findById(q.params.id).populate("owner", "name").lean();
  if (!l) throw fail(404, "Listing not found");
  l.reviews = await Review.find({ listing: l._id }).populate("author", "name").sort("-createdAt").lean();
  s.json(l);
}));
r.post("/listings", auth, wrap(async (q, s) => {
  const u = await User.findById(q.userId); if (u.role !== "host") throw fail(403, "Only hosts can add listings");
  const { title, description, image, price, cleaningFee, location, country, category, maxGuests, safetyTags, place, images, lat, lng } = q.body;
  const hasPt = lat !== undefined && lat !== "";
  if (hasPt && !(Math.abs(+lat) <= 90 && Math.abs(+lng) <= 180)) throw fail(400, "Latitude must be between -90 and 90, longitude between -180 and 180");
  s.status(201).json(await Listing.create({ title, description, image, price, cleaningFee, location, country, category, maxGuests, safetyTags, place, images: Array.isArray(images) ? images.filter((x) => typeof x === "string" && x).slice(0, 10) : [], owner: u._id, ...(hasPt && { lat: +lat, lng: +lng }) }));
}));

// ---- wishlist
r.get("/wishlist", auth, wrap(async (q, s) => {
  const u = await User.findById(q.userId).populate({ path: "wishlist", populate: { path: "owner", select: "name" } }).lean();
  s.json((u?.wishlist || []).filter(Boolean).map((l) => ({ ...l, priceWithTaxes: stayCost({ ...l, cleaningFee: 0 }, 1).total })));
}));
r.post("/wishlist/:id", auth, wrap(async (q, s) => {
  const u = await User.findById(q.userId), i = u.wishlist.findIndex((x) => x.equals(q.params.id));
  i < 0 ? u.wishlist.push(q.params.id) : u.wishlist.splice(i, 1); await u.save(); s.json({ wishlist: u.wishlist });
}));

// ---- bookings: transparent price + no double booking
async function quote(q) {
  const { listingId, checkIn, checkOut, guests = 1 } = q.body, l = await Listing.findById(listingId);
  if (!l) throw fail(404, "Listing not found");
  const a = new Date(checkIn), b = new Date(checkOut);
  if (isNaN(a) || isNaN(b) || b <= a || a < new Date(new Date().toDateString())) throw fail(400, "Choose valid future dates");
  if (guests < 1 || guests > l.maxGuests) throw fail(400, `This place fits up to ${l.maxGuests} guests`);
  const nights = Math.round((b - a) / 864e5);
  return { l, a, b, nights, guests: +guests, cost: stayCost(l, nights) };
}
r.post("/bookings/quote", wrap(async (q, s) => { const { nights, cost } = await quote(q); s.json({ nights, cost }); }));
r.post("/bookings", auth, wrap(async (q, s) => {
  const { l, a, b, guests, cost } = await quote(q);
  if (l.owner?.equals(q.userId)) throw fail(400, "You can't book your own listing");
  // production: wrap check+create in a transaction to rule out races
  if (await Booking.exists({ listing: l._id, status: "confirmed", checkIn: { $lt: b }, checkOut: { $gt: a } })) throw fail(409, "Those dates are already booked");
  s.status(201).json(await Booking.create({ listing: l._id, guest: q.userId, checkIn: a, checkOut: b, guests, cost }));
}));
r.get("/bookings/mine", auth, wrap(async (q, s) => s.json(await Booking.find({ guest: q.userId }).populate("listing", "title image location").sort("-createdAt"))));

// ---- reviews: only guests who booked
r.post("/listings/:id/reviews", auth, wrap(async (q, s) => {
  const { rating, comment } = q.body;
  if (!(rating >= 1 && rating <= 5) || !comment) throw fail(400, "A rating (1-5) and a comment are required");
  const strict = process.env.STRICT_REVIEWS === "true" ? { checkOut: { $lte: new Date() } } : {};
  const bk = await Booking.findOne({ listing: q.params.id, guest: q.userId, status: "confirmed", ...strict });
  if (!bk) throw fail(403, "Only guests who stayed here can review it");
  if (await Review.exists({ booking: bk._id })) throw fail(409, "You already reviewed this stay");
  await Review.create({ listing: bk.listing, author: q.userId, booking: bk._id, rating, comment });
  const [st] = await Review.aggregate([{ $match: { listing: bk.listing } }, { $group: { _id: null, avg: { $avg: "$rating" }, n: { $sum: 1 } } }]);
  await Listing.findByIdAndUpdate(bk.listing, { avgRating: +st.avg.toFixed(1), reviewCount: st.n });
  s.status(201).json({ ok: true });
}));
module.exports = r;
