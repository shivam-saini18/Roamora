require("dotenv").config();

const mongoose = require("mongoose");
const Activity = require("./models/Activity");

const destinations = [
  {
    destination: "Manali",
    activities: [
      ["Hadimba Temple visit", "culture", 0, 1],
      ["Mall Road walk and street food", "food", 150, 2],
      ["Vashisht hot springs", "relax", 50, 2],
      ["Old Manali cafe hopping", "food", 250, 2],
      ["Solang Valley adventure activities", "adventure", 600, 4],
      ["Naggar Castle", "sightseeing", 100, 2],
      ["Jogini Falls trek", "adventure", 100, 3],
      ["Atal Tunnel and Sissu trip", "sightseeing", 400, 4]
    ]
  },
  {
    destination: "Goa",
    activities: [
      ["Baga Beach visit", "relax", 0, 2],
      ["Calangute Beach walk", "relax", 0, 2],
      ["Fort Aguada visit", "sightseeing", 50, 2],
      ["Old Goa churches tour", "culture", 100, 3],
      ["Goa local seafood experience", "food", 400, 2],
      ["Dudhsagar Falls day trip", "adventure", 1200, 8],
      ["Anjuna flea market visit", "shopping", 100, 2],
      ["Dona Paula viewpoint", "sightseeing", 0, 1]
    ]
  },
  {
    destination: "Delhi",
    activities: [
      ["India Gate visit", "sightseeing", 0, 1],
      ["Red Fort visit", "culture", 50, 2],
      ["Qutub Minar visit", "culture", 40, 2],
      ["Humayun's Tomb visit", "culture", 40, 2],
      ["Chandni Chowk food walk", "food", 300, 2],
      ["Lotus Temple visit", "sightseeing", 0, 2],
      ["National Museum visit", "culture", 200, 2],
      ["Connaught Place evening walk", "relax", 100, 2]
    ]
  },
  {
    destination: "Jaipur",
    activities: [
      ["Amber Fort visit", "culture", 200, 3],
      ["Hawa Mahal visit", "sightseeing", 100, 1],
      ["City Palace visit", "culture", 200, 2],
      ["Jantar Mantar visit", "culture", 100, 2],
      ["Jaipur street food walk", "food", 300, 2],
      ["Nahargarh Fort sunset", "sightseeing", 100, 2],
      ["Local handicraft market visit", "shopping", 200, 2],
      ["Jal Mahal viewpoint", "sightseeing", 0, 1]
    ]
  },
  {
    destination: "Rishikesh",
    activities: [
      ["Triveni Ghat Ganga Aarti", "culture", 0, 2],
      ["Ram Jhula and Lakshman Jhula walk", "sightseeing", 0, 2],
      ["Beatles Ashram visit", "culture", 200, 2],
      ["Ganga riverside relaxation", "relax", 0, 2],
      ["Local cafe and food walk", "food", 300, 2],
      ["White-water rafting", "adventure", 1000, 3],
      ["Neer Garh waterfall trek", "adventure", 50, 3],
      ["Yoga session", "relax", 300, 1]
    ]
  },
  {
    destination: "Ooty",
    activities: [
      ["Ooty Botanical Gardens visit", "sightseeing", 50, 2],
      ["Ooty Lake visit", "relax", 50, 2],
      ["Nilgiri Mountain Railway ride", "sightseeing", 300, 3],
      ["Doddabetta Peak viewpoint", "sightseeing", 50, 2],
      ["Tea factory visit", "culture", 100, 2],
      ["Rose Garden visit", "sightseeing", 50, 2],
      ["Local tea and food tasting", "food", 200, 2],
      ["Pykara Falls trip", "adventure", 150, 3]
    ]
  }
];

async function main() {
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is missing from server .env");
  }

  await mongoose.connect(process.env.MONGO_URL);

  let added = 0;
  let skipped = 0;

  for (const place of destinations) {
    for (const [name, category, costPerPerson, durationHours] of place.activities) {
      const result = await Activity.updateOne(
        { destination: place.destination, name },
        {
          $setOnInsert: {
            destination: place.destination,
            name,
            category,
            costPerPerson,
            durationHours
          }
        },
        { upsert: true }
      );

      if (result.upsertedCount > 0) added++;
      else skipped++;
    }
  }

  console.log(`Activities added: ${added}`);
  console.log(`Activities already present: ${skipped}`);
  console.log("Existing users and listings were preserved.");

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
