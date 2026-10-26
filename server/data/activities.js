// Things to do per destination, used by the AI Copilot trip planner. The Copilot can only plan trips for destinations listed here.
// Prices are rough demo values in INR per person; check and edit them before relying on them.
// To add a destination: add a D("Name", [...]) line. The name must appear in the stays' location text (e.g. "Goa" in "Calangute, Goa").
// Row format: [activity name, category, costPerPerson, durationHours]   category = adventure | sightseeing | culture | relax | food
const D = (destination, rows) => rows.map(([name, category, costPerPerson, durationHours]) => ({ name, destination, category, costPerPerson, durationHours }));

const activities = [
  ...D("Manali", [
    ["Hadimba Temple visit", "culture", 0, 1], ["Mall Road walk and street food", "food", 150, 2], ["Vashisht hot springs", "relax", 50, 2],
    ["Old Manali cafe hopping", "food", 250, 2], ["Solang Valley snow activities", "adventure", 600, 4], ["Naggar Castle", "sightseeing", 100, 2],
    ["Jogini Falls trek", "adventure", 100, 3], ["Atal Tunnel and Sissu", "sightseeing", 400, 4], ["Rohtang Pass day trip (permit + taxi share)", "adventure", 900, 8],
  ]),
  ...D("Goa", [
    ["Baga and Calangute beach day", "relax", 0, 4], ["Fort Aguada and Chapora sunset", "sightseeing", 100, 3], ["Old Goa churches walk", "culture", 50, 3],
    ["Fontainhas heritage walk and cafes", "culture", 200, 2], ["Water sports at Calangute", "adventure", 1200, 3], ["Seafood lunch at a beach shack", "food", 600, 2],
    ["Dudhsagar waterfalls jeep trip", "adventure", 900, 6], ["Anjuna flea market", "sightseeing", 0, 2],
  ]),
  ...D("Jaipur", [
    ["Amer Fort", "sightseeing", 200, 3], ["City Palace and Jantar Mantar", "culture", 300, 3], ["Hawa Mahal and Johari Bazaar walk", "sightseeing", 50, 2],
    ["Rajasthani thali and lassi crawl", "food", 400, 2], ["Nahargarh Fort sunset", "relax", 50, 2], ["Block printing workshop", "culture", 500, 2],
  ]),
  ...D("Udaipur", [
    ["City Palace tour", "culture", 300, 2], ["Lake Pichola boat ride", "relax", 400, 1], ["Saheliyon ki Bari", "sightseeing", 50, 1],
    ["Ambrai ghat sunset dinner", "food", 500, 2], ["Sajjangarh Monsoon Palace", "sightseeing", 300, 2], ["Bagore ki Haveli folk show", "culture", 150, 1],
  ]),
  ...D("Jaisalmer", [
    ["Jaisalmer Fort walk", "culture", 50, 2], ["Sam sand dunes camel safari", "adventure", 800, 4], ["Patwon ki Haveli", "sightseeing", 100, 1],
    ["Gadisar Lake at sunrise", "relax", 0, 2], ["Folk music and dinner at the dunes", "food", 600, 3], ["Kuldhara ghost village", "sightseeing", 100, 2],
  ]),
  ...D("Ooty", [
    ["Nilgiri Mountain Railway ride", "sightseeing", 300, 3], ["Botanical Gardens", "relax", 50, 2], ["Ooty Lake boating", "relax", 250, 1],
    ["Doddabetta Peak", "sightseeing", 20, 2], ["Tea factory visit and tasting", "culture", 100, 2], ["Avalanche Lake trek", "adventure", 400, 4],
  ]),
  ...D("Coorg", [
    ["Abbey Falls", "sightseeing", 50, 2], ["Coffee plantation walk and tasting", "culture", 300, 2], ["Raja's Seat sunset", "relax", 20, 1],
    ["Dubare elephant camp and river", "adventure", 500, 3], ["Tadiandamol trek", "adventure", 300, 6], ["Coorgi pandi curry lunch", "food", 450, 2],
  ]),
  ...D("Munnar", [
    ["Tea Museum and tea estate walk", "culture", 150, 2], ["Eravikulam National Park", "sightseeing", 400, 3], ["Mattupetty Dam and Echo Point", "sightseeing", 100, 2],
    ["Top Station viewpoint", "relax", 50, 3], ["Kolukkumalai jeep sunrise ride", "adventure", 600, 4], ["Kerala sadya lunch", "food", 300, 1],
  ]),
  ...D("Shimla", [
    ["The Ridge and Mall Road walk", "sightseeing", 0, 2], ["Jakhoo Temple ropeway", "culture", 150, 2], ["Kufri snow and horse ride", "adventure", 800, 4],
    ["Christ Church and Scandal Point", "culture", 0, 1], ["Café hopping on Mall Road", "food", 400, 2], ["Mashobra and Naldehra drive", "relax", 300, 4],
  ]),
  ...D("Darjeeling", [
    ["Tiger Hill sunrise", "sightseeing", 300, 3], ["Toy Train joyride", "sightseeing", 1000, 2], ["Happy Valley tea estate", "culture", 100, 2],
    ["Himalayan Mountaineering Institute and zoo", "culture", 200, 3], ["Momo and thukpa food walk", "food", 350, 2], ["Batasia Loop and Ghum monastery", "relax", 100, 2],
  ]),
  ...D("Rishikesh", [
    ["White water rafting", "adventure", 800, 3], ["Ganga aarti at Triveni Ghat", "culture", 0, 1], ["Laxman Jhula and Ram Jhula walk", "sightseeing", 0, 2],
    ["Bungee or cliff jumping", "adventure", 3500, 2], ["Yoga session by the river", "relax", 400, 2], ["Cafe hopping in Tapovan", "food", 400, 2],
  ]),
  ...D("Delhi", [
    ["Red Fort and Jama Masjid", "culture", 100, 3], ["Chandni Chowk food walk", "food", 500, 3], ["India Gate and Rajpath evening", "sightseeing", 0, 2],
    ["Humayun's Tomb and Lodhi Garden", "culture", 100, 3], ["Qutub Minar", "sightseeing", 100, 2], ["Hauz Khas Village cafes", "food", 600, 2],
  ]),
  ...D("Mumbai", [
    ["Gateway of India and Colaba walk", "sightseeing", 0, 2], ["Marine Drive sunset", "relax", 0, 2], ["Elephanta Caves ferry", "culture", 300, 4],
    ["Street food: vada pav and pav bhaji trail", "food", 300, 2], ["Bandra Bandstand and Carter Road", "relax", 0, 2], ["Dharavi walking tour", "culture", 700, 3],
  ]),
  ...D("Wayanad", [
    ["Edakkal Caves hike", "adventure", 100, 3], ["Soochipara Falls", "sightseeing", 50, 3], ["Banasura Sagar Dam", "relax", 50, 2],
    ["Chembra Peak trek", "adventure", 100, 6], ["Spice plantation tour", "culture", 200, 2], ["Kuruva Island bamboo rafting", "adventure", 150, 3],
  ]),
  ...D("Puducherry", [
    ["French Quarter heritage walk", "culture", 0, 2], ["Promenade Beach sunrise", "relax", 0, 1], ["Auroville and Matrimandir", "culture", 0, 3],
    ["Paradise Beach boat ride", "relax", 150, 3], ["Cafe and bakery trail", "food", 500, 2], ["Scuba diving at Temple Reef", "adventure", 3500, 3],
  ]),
  ...D("Alleppey", [
    ["Backwater houseboat cruise", "relax", 1800, 6], ["Village canoe ride", "adventure", 300, 2], ["Alleppey beach and lighthouse", "sightseeing", 20, 2],
    ["Kerala fish curry and appam lunch", "food", 350, 1], ["Kuttanad paddy field walk", "culture", 0, 2], ["Marari beach day", "relax", 0, 3],
  ]),
  ...D("Ladakh", [
    ["Leh Palace and Shanti Stupa", "sightseeing", 100, 3], ["Pangong Lake day trip", "adventure", 2500, 10], ["Thiksey and Hemis monasteries", "culture", 150, 5],
    ["Magnetic Hill and Sangam", "sightseeing", 400, 4], ["Leh market and Tibetan food", "food", 350, 2], ["Khardung La pass drive", "adventure", 1500, 8],
  ]),
  ...D("Kodaikanal", [
    ["Kodai Lake boating and cycling", "relax", 300, 2], ["Coaker's Walk", "sightseeing", 30, 1], ["Pillar Rocks and Guna Caves", "sightseeing", 50, 3],
    ["Bryant Park", "relax", 30, 1], ["Berijam Lake forest drive", "adventure", 600, 4], ["Homemade chocolate tasting", "food", 200, 1],
  ]),
  ...D("Varanasi", [
    ["Ganga aarti at Dashashwamedh Ghat", "culture", 0, 2], ["Sunrise boat ride on the Ganga", "relax", 300, 2], ["Kashi Vishwanath temple", "culture", 0, 2],
    ["Sarnath day trip", "sightseeing", 100, 4], ["Kachori, lassi and malaiyo food walk", "food", 300, 2], ["Old city lane walk", "sightseeing", 0, 2],
  ]),
];

module.exports = { activities };