const m = require("mongoose"); const { Schema } = m;
const ref = (t) => ({ type: Schema.Types.ObjectId, ref: t });
const CATS = ["Beach","Mountain","City","Forest","Snow","Lake","Camping","Historical","Desert","Farm"];
const User = m.model("User", new Schema({
  name: { type: String, required: true }, email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, role: { type: String, enum: ["guest","host"], default: "guest" }, wishlist: [ref("Listing")],
}));
const Listing = m.model("Listing", new Schema({
  title: { type: String, required: true }, description: String, image: String, images: [String],
  price: { type: Number, required: true, min: 0 }, cleaningFee: { type: Number, default: 0 },
  location: String, country: String, place: String, lat: Number, lng: Number, propertyType: String, bedrooms: Number, beds: Number, baths: Number, amenities: [String], category: { type: String, enum: CATS }, maxGuests: { type: Number, default: 4 },
  avgRating: { type: Number, default: null }, reviewCount: { type: Number, default: 0 }, safetyTags: [String], owner: ref("User"),
}, { timestamps: true }));
const Booking = m.model("Booking", new Schema({
  listing: ref("Listing"), guest: ref("User"), checkIn: Date, checkOut: Date, guests: Number, cost: Object,
  status: { type: String, default: "confirmed" },
}, { timestamps: true }));
const Review = m.model("Review", new Schema({
  listing: ref("Listing"), author: ref("User"), booking: { ...ref("Booking"), unique: true },
  rating: { type: Number, min: 1, max: 5 }, comment: String,
}, { timestamps: true }));
module.exports = { User, Listing, Booking, Review, CATS };
