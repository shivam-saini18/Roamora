require("dotenv").config();
const mongoose = require("mongoose"), bcrypt = require("bcryptjs");
const { User, Listing, Booking, Review } = require("./models"); const Activity = require("./models/Activity");
const { stayCost } = require("./services/budget");
const { listings, HOSTS } = require("./data/listings"); // add or edit stays in data/listings.js

const GUESTS = ["Aarav", "Diya", "Rohan", "Ishita", "Kabir", "Neha"];
const REVIEWS = [
  "Lovely stay! The host was very welcoming and the place was exactly as shown in the photos.",
  "Spotless rooms and a great view. Would happily book again.",
  "Perfect for a weekend away. Easy check-in and a quiet neighbourhood.",
  "Great value for money. {place} is beautiful and the host gave us excellent local tips.",
  "Cozy and comfortable. Hot water and wifi worked well throughout our stay.",
  "Wonderful experience, it felt like home. Highly recommended for families.",
  "The photos don't do it justice. We loved every moment of our trip to {place}.",
  "Good location and a friendly host. The bed was very comfortable.",
];
const A = (name, category, costPerPerson, durationHours) => ({ name, destination: "Manali", category, costPerPerson, durationHours });

(async () => {
  await mongoose.connect(process.env.MONGO_URL);
  await Promise.all([User.deleteMany({}), Listing.deleteMany({}), Activity.deleteMany({}), Booking.deleteMany({}), Review.deleteMany({})]);
  const pw = await bcrypt.hash("demo1234", 10);
  // hosts: first one is host@demo.com, the others are rahul/anita/... @demo.com. Guests are aarav/diya/... @demo.com. Password for all: demo1234
  const hosts = await User.insertMany(HOSTS.map((name, i) => ({ name, email: i === 0 ? "host@demo.com" : `${name.toLowerCase()}@demo.com`, password: pw, role: "host" })));
  const guests = await User.insertMany(GUESTS.map((name) => ({ name, email: `${name.toLowerCase()}@demo.com`, password: pw, role: "guest" })));
  const stays = await Listing.insertMany(listings.map((x, i) => ({ ...x, owner: hosts[i % hosts.length]._id })));

  // 3 sample reviews (with matching past bookings) for every stay that has a rating
  const bks = [], meta = [];
  stays.filter((l) => l.reviewCount > 0).forEach((l, i) => [0, 1, 2].forEach((k) => {
    const guest = guests[(i + k) % guests.length];
    const out = new Date(Date.now() - (20 + i * 3 + k * 11) * 864e5), inn = new Date(out - 2 * 864e5);
    bks.push({ listing: l._id, guest: guest._id, checkIn: inn, checkOut: out, guests: 2, cost: stayCost(l, 2) });
    meta.push({ listing: l._id, author: guest._id, rating: l.avgRating >= 4.8 || k !== 1 ? 5 : 4, comment: REVIEWS[(i + k * 3) % REVIEWS.length].replace("{place}", l.place) });
  }));
  const made = await Booking.insertMany(bks);
  await Review.insertMany(made.map((b, j) => ({ ...meta[j], booking: b._id })));

  await Activity.insertMany([
    A("Hadimba Temple visit", "culture", 0, 1), A("Mall Road walk and street food", "food", 150, 2), A("Vashisht hot springs", "relax", 50, 2),
    A("Old Manali cafe hopping", "food", 250, 2), A("Solang Valley snow activities", "adventure", 600, 4), A("Naggar Castle", "sightseeing", 100, 2),
    A("Jogini Falls trek", "adventure", 100, 3), A("Atal Tunnel and Sissu", "sightseeing", 400, 4), A("Rohtang Pass day trip (permit + taxi share)", "adventure", 900, 8),
  ]);
  await Activity.insertMany(require("./data/activities").activities.filter((a) => a.destination !== "Manali")); // other destinations for the AI Copilot (Manali is inserted above)
  console.log(`Seeded ${stays.length} stays, ${HOSTS.length} hosts, ${GUESTS.length} guests, ${made.length} reviews. Logins (password demo1234): host@demo.com, aarav@demo.com`);
  process.exit(0);
})();