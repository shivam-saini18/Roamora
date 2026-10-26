// All demo stays live here. To add a stay, add one S(...) line at the bottom of the list and run `npm run seed` (the seed resets the database).
//
// S(title, category, location, place, pricePerNight, lat, lng, rating, reviewCount, extra)
//   place   = the home-page row it appears in ("Manali", "Goa"...). Two or more stays with the same place get their own row.
//   rating  = demo rating (null = "New")
//   extra   = optional: { type, maxGuests, bedrooms, beds, baths, safetyTags, amenities, cleaningFee, description, images: [url, ...] }
//             type = "Cabin", "Villa", "Homestay", "Flat"... (shows as "Cabin in Old Manali" on the card)
//
// PHOTOS: stays get 5 placeholder photos from picsum.photos (random scenic photos, not the actual place).
// They are NOT photos of the actual place. To use real photos pass your own URLs: { images: ["https://.../1.jpg", ...] }.
// The first image is the cover on the cards; the listing page shows 5 in the grid and all of them under "Show all photos".

const HOSTS = ["Priya", "Rahul", "Anita", "Karan", "Meera", "Vikram", "Sana", "Arjun"]; // the seed creates these as host accounts (first one = host@demo.com)

// Defaults per category: property type, amenities, and a few words for the generated description.
const CAT = {
  Beach:      { type: "Villa",         tags: "beach,resort",       vibe: "a short walk from the sand",                 ideal: "families and friend groups",   amenities: ["Beach access", "Air conditioning", "Wifi", "Kitchen", "Balcony", "Free parking"] },
  Mountain:   { type: "Cabin",         tags: "mountain,cabin",     vibe: "with mountain views from the windows",       ideal: "couples and small groups",     amenities: ["Mountain view", "Room heater", "Wifi", "Kitchen", "Bonfire (on request)", "Free parking"] },
  City:       { type: "Apartment",     tags: "apartment,city",     vibe: "close to cafes, markets and transport",      ideal: "business and city-break trips", amenities: ["Air conditioning", "Wifi", "Kitchen", "Lift", "Workspace", "Smart TV"] },
  Forest:     { type: "Treehouse",     tags: "forest,treehouse",   vibe: "surrounded by trees and birdsong",           ideal: "nature lovers",                amenities: ["Forest view", "Hot water", "Wifi", "Bonfire (on request)", "Nature walks", "Free parking"] },
  Snow:       { type: "Studio",        tags: "snow,chalet",        vibe: "with snow-capped views all winter",          ideal: "couples and snow trips",       amenities: ["Snow view", "Room heater", "Hot water", "Wifi", "Breakfast included", "Free parking"] },
  Lake:       { type: "Villa",         tags: "lake,villa",         vibe: "right by the water",                         ideal: "slow, relaxing holidays",      amenities: ["Lake view", "Air conditioning", "Wifi", "Balcony", "Breakfast included", "Free parking"] },
  Camping:    { type: "Camp",          tags: "camping,tent",       vibe: "in an open, scenic spot",                    ideal: "adventure seekers",            amenities: ["Mattresses and blankets", "Bonfire", "Shared bathroom", "Drinking water", "Common dining area", "Parking nearby"], noRooms: true },
  Historical: { type: "Heritage home", tags: "palace,heritage",    vibe: "in a restored historic building",            ideal: "culture and food lovers",      amenities: ["Courtyard", "Rooftop terrace", "Air conditioning", "Wifi", "Breakfast included", "Hot water"] },
  Desert:     { type: "Camp",          tags: "desert,camp",        vibe: "under a huge desert sky",                    ideal: "groups and first-time visitors", amenities: ["Bonfire and folk music", "Camel safari (extra)", "Attached bathroom", "Meals included", "Desert view", "Parking nearby"], noRooms: true },
  Farm:       { type: "Cottage",       tags: "farmhouse,countryside", vibe: "on a quiet working farm",                 ideal: "families and slow travellers", amenities: ["Garden", "Home-cooked meals", "Farm walks", "Wifi", "Hot water", "Free parking"] },
};
const INSIDE = ["bedroom,interior", "living,room", "view,landscape", "kitchen,interior"];
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % 9000;
const pics = (title, category) => [CAT[category].tags, ...INSIDE].map((tag, i) => `https://picsum.photos/seed/${encodeURIComponent(title + "-" + i)}/1200/800`);

const S = (title, category, location, place, price, lat, lng, avgRating = null, reviewCount = 0, extra = {}) => {
  const c = CAT[category], type = extra.type || c.type, maxGuests = extra.maxGuests || 4, city = location.split(",")[0];
  const bedrooms = c.noRooms ? undefined : extra.bedrooms || Math.max(1, Math.ceil(maxGuests / 2));
  const beds = extra.beds || Math.max(bedrooms || 1, Math.ceil(maxGuests * 0.75));
  const baths = extra.baths || (c.noRooms ? 1 : Math.max(1, Math.ceil(bedrooms / 2)));
  const amenities = extra.amenities || c.amenities;
  const images = extra.images || pics(title, category);
  const rooms = bedrooms ? ` across ${bedrooms} bedroom${bedrooms > 1 ? "s" : ""}` : "";
  const description = `${title} is a ${type.toLowerCase()} in ${city}, ${c.vibe}. It sleeps ${maxGuests}${rooms} and comes with ${amenities.slice(0, 3).map((a) => a.toLowerCase()).join(", ")}. A good fit for ${c.ideal}.`;
  return {
    title, category, location, place, country: "India", price, lat, lng, avgRating, reviewCount,
    cleaningFee: 200, description, propertyType: type, maxGuests, bedrooms, beds, baths, amenities,
    ...extra, images, image: images[0],
  };
};

const listings = [
  // Manali
  S("Pine Cabin, Old Manali", "Mountain", "Old Manali, Himachal Pradesh", "Manali", 1400, 32.2562, 77.1767, 4.9, 23, { safetyTags: ["Verified host"] }),
  S("Riverside Homestay", "Mountain", "Manali, Himachal Pradesh", "Manali", 1100, 32.2432, 77.1892, 4.8, 14, { type: "Homestay", safetyTags: ["Family friendly"] }),
  S("Snow View Studio", "Snow", "Manali, Himachal Pradesh", "Manali", 2200, 32.2500, 77.1900, 4.6, 9, { maxGuests: 2, safetyTags: ["Women friendly"] }),
  S("Apple Orchard Cottage", "Farm", "Naggar, near Manali", "Manali", 1800, 32.1100, 77.1730),
  S("Cedar Log Hut, Vashisht", "Mountain", "Vashisht, Manali", "Manali", 1600, 32.2650, 77.1870, 4.8, 17, { type: "Log hut", safetyTags: ["Verified host"] }),
  S("Riverside Camping Tents, Solang", "Camping", "Solang Valley, Manali", "Manali", 1200, 32.3163, 77.1569, 4.5, 6, { maxGuests: 3, type: "Tent" }),
  // Goa
  S("Beachfront Cottage", "Beach", "Calangute, Goa", "Goa", 3200, 15.5439, 73.7553, 4.8, 40, { type: "Cottage" }),
  S("Palm Grove Villa, Candolim", "Beach", "Candolim, Goa", "Goa", 5200, 15.5180, 73.7620, 4.9, 27, { maxGuests: 6, amenities: ["Private pool", "Air conditioning", "Wifi", "Kitchen", "Beach nearby", "Free parking"] }),
  S("Sunset Studio, Anjuna", "Beach", "Anjuna, Goa", "Goa", 2600, 15.5736, 73.7413, 4.7, 11, { type: "Studio", maxGuests: 2, safetyTags: ["Women friendly"] }),
  S("Paddy Field Homestay, Benaulim", "Farm", "Benaulim, South Goa", "Goa", 2100, 15.2547, 73.9330, null, 0, { type: "Homestay" }),
  S("Palolem Beach Hut", "Beach", "Palolem, South Goa", "Goa", 2300, 15.0100, 74.0230, 4.6, 12, { type: "Beach hut", maxGuests: 2 }),
  S("Fontainhas Portuguese House", "Historical", "Fontainhas, Panaji", "Goa", 3800, 15.4989, 73.8310, 4.8, 15, { type: "Heritage home" }),
  // Rajasthan
  S("Heritage Haveli", "Historical", "Jaipur, Rajasthan", "Rajasthan", 2800, 26.9124, 75.7873, 4.9, 31, { type: "Haveli" }),
  S("Desert Camp", "Desert", "Jaisalmer, Rajasthan", "Rajasthan", 2500, 26.9157, 70.9083, 4.7, 12),
  S("Lakeside Villa", "Lake", "Udaipur, Rajasthan", "Rajasthan", 4200, 24.5854, 73.7125, 5.0, 18),
  S("Blue City Terrace Room", "City", "Jodhpur, Rajasthan", "Rajasthan", 1900, 26.2976, 73.0236, 4.8, 15, { type: "Room", maxGuests: 3 }),
  S("Pushkar Camel Camp", "Desert", "Pushkar, Rajasthan", "Rajasthan", 1700, 26.4897, 74.5511, 4.6, 8),
  S("Amer Fort View Haveli", "Historical", "Amer, Jaipur", "Rajasthan", 3300, 26.9855, 75.8513, 4.8, 19, { type: "Haveli" }),
  // Ooty
  S("Tea Estate Cottage", "Mountain", "Ooty, Tamil Nadu", "Ooty", 3400, 11.4102, 76.6950, 4.9, 21, { type: "Cottage", maxGuests: 5 }),
  S("Misty Hill Bungalow", "Mountain", "Ooty, Tamil Nadu", "Ooty", 4800, 11.3990, 76.7100, 4.8, 13, { type: "Bungalow", maxGuests: 6 }),
  S("Lakeview Room, Ooty", "Lake", "Ooty, Tamil Nadu", "Ooty", 2300, 11.4040, 76.6860, 4.6, 7, { type: "Room", maxGuests: 2 }),
  // Coorg
  S("Coffee Plantation Stay", "Farm", "Madikeri, Coorg", "Coorg", 3600, 12.4244, 75.7382, 4.9, 19, { type: "Farm stay" }),
  S("Waterfall Cabin, Coorg", "Forest", "Abbey Falls Road, Coorg", "Coorg", 4100, 12.4566, 75.7228, 4.7, 10, { type: "Cabin" }),
  S("Hilltop Homestay, Madikeri", "Mountain", "Madikeri, Coorg", "Coorg", 2700, 12.4180, 75.7450, 4.8, 16, { type: "Homestay" }),
  // Wayanad
  S("Forest Treehouse", "Forest", "Wayanad, Kerala", "Wayanad", 3000, 11.6854, 76.1320, 4.9, 22),
  S("Spice Garden Cottage", "Farm", "Kalpetta, Wayanad", "Wayanad", 2800, 11.6085, 76.0830, 4.8, 12),
  // Munnar
  S("Tea Valley Villa", "Mountain", "Munnar, Kerala", "Munnar", 4400, 10.0889, 77.0595, 4.9, 24, { type: "Villa", maxGuests: 6 }),
  S("Cloud Nine Cottage", "Mountain", "Munnar, Kerala", "Munnar", 3100, 10.0750, 77.0700, 4.7, 11, { type: "Cottage" }),
  S("Spice Route Homestay", "Farm", "Chinnakanal, Munnar", "Munnar", 2200, 10.0000, 77.1000, 4.6, 8, { type: "Homestay" }),
  // Shimla
  S("Colonial Cottage, Mashobra", "Historical", "Mashobra, Shimla", "Shimla", 3100, 31.0897, 77.1200, 4.8, 14, { type: "Cottage" }),
  S("Deodar Retreat, Kufri", "Mountain", "Kufri, Shimla", "Shimla", 2600, 31.0980, 77.2670, 4.7, 9),
  S("Mall Road View Room", "City", "Shimla, Himachal Pradesh", "Shimla", 1800, 31.1048, 77.1734, 4.5, 20, { type: "Room", maxGuests: 2 }),
  // Darjeeling
  S("Tea Garden Bungalow", "Mountain", "Darjeeling, West Bengal", "Darjeeling", 3600, 27.0360, 88.2627, 4.9, 17, { type: "Bungalow", maxGuests: 5 }),
  S("Kanchenjunga View Homestay", "Mountain", "Darjeeling, West Bengal", "Darjeeling", 2400, 27.0410, 88.2663, 4.8, 13, { type: "Homestay" }),
  // Kodaikanal
  S("Pine Forest Cottage", "Forest", "Kodaikanal, Tamil Nadu", "Kodaikanal", 3300, 10.2381, 77.4892, 4.8, 12, { type: "Cottage" }),
  S("Lake Road Homestay", "Lake", "Kodaikanal, Tamil Nadu", "Kodaikanal", 2100, 10.2360, 77.4880, 4.6, 9, { type: "Homestay" }),
  // Ladakh
  S("Leh Old Town Guesthouse", "Mountain", "Leh, Ladakh", "Ladakh", 2600, 34.1650, 77.5840, 4.8, 16, { type: "Guesthouse" }),
  S("Pangong Lakeside Camp", "Camping", "Pangong, Ladakh", "Ladakh", 3500, 33.7595, 78.6674, 4.7, 10, { maxGuests: 3, type: "Camp" }),
  // Bengaluru
  S("Indiranagar Loft", "City", "Indiranagar, Bengaluru", "Bengaluru", 3400, 12.9719, 77.6412, 4.7, 21, { type: "Loft", maxGuests: 3 }),
  S("Nandi Hills Farm Villa", "Farm", "Nandi Hills, Karnataka", "Bengaluru", 6200, 13.3702, 77.6835, 4.9, 14, { type: "Villa", maxGuests: 8 }),
  // Mumbai
  S("Bandra Sea-Facing Flat", "City", "Bandra, Mumbai", "Mumbai", 5200, 19.0596, 72.8295, 4.8, 25, { type: "Flat", maxGuests: 3 }),
  S("Colaba Heritage Apartment", "Historical", "Colaba, Mumbai", "Mumbai", 4600, 18.9067, 72.8147, 4.7, 14, { type: "Apartment" }),
  // Puducherry
  S("French Quarter Townhouse", "Historical", "White Town, Puducherry", "Puducherry", 4200, 11.9340, 79.8300, 4.9, 20, { type: "Townhouse" }),
  S("Auroville Garden Cottage", "Farm", "Auroville, Puducherry", "Puducherry", 2400, 12.0070, 79.8100, 4.7, 9, { maxGuests: 2 }),
  // Rishikesh
  S("Riverside Camping Pods", "Camping", "Rishikesh, Uttarakhand", "Rishikesh", 900, 30.0869, 78.2676, 4.5, 10, { type: "Pod", maxGuests: 2 }),
  S("Ganga View Retreat", "Mountain", "Tapovan, Rishikesh", "Rishikesh", 2200, 30.1260, 78.3150, 4.8, 18, { type: "Retreat" }),
  // Delhi
  S("City Loft", "City", "Delhi", "Delhi", 2000, 28.6139, 77.2090, 4.6, 13, { type: "Loft" }),
  S("Old Delhi Haveli Room", "Historical", "Chandni Chowk, Delhi", "Delhi", 2600, 28.6562, 77.2310, 4.8, 16, { type: "Haveli", maxGuests: 3 }),
  // Single stays (they share the "More stays across India" row)
  S("Houseboat Stay, Alleppey", "Lake", "Alleppey, Kerala", "Alleppey", 5500, 9.4981, 76.3388, 4.9, 34, { type: "Houseboat", bedrooms: 2 }),
  S("Dharamshala Cloud Cabin", "Mountain", "McLeod Ganj, Dharamshala", "Dharamshala", 2000, 32.2426, 76.3213, 4.7, 8),
  S("Kasol Riverside Camp", "Camping", "Kasol, Himachal Pradesh", "Kasol", 1300, 32.0100, 77.3150),
  S("Auli Snow Lodge", "Snow", "Auli, Uttarakhand", "Auli", 3900, 30.5290, 79.5660, 4.8, 6, { type: "Lodge" }),
  S("Ghat View Haveli", "Historical", "Varanasi, Uttar Pradesh", "Varanasi", 2700, 25.3109, 83.0107, 4.8, 22, { type: "Haveli" }),
  S("Boulder View Stay, Hampi", "Historical", "Hampi, Karnataka", "Hampi", 1500, 15.3350, 76.4600, 4.6, 11, { type: "Homestay" }),
  S("Cliffside Beach Cottage", "Beach", "Gokarna, Karnataka", "Gokarna", 2800, 14.5479, 74.3188, 4.7, 9, { type: "Cottage" }),
  S("Banjara Hills Flat", "City", "Banjara Hills, Hyderabad", "Hyderabad", 3000, 17.4126, 78.4482, 4.7, 18, { type: "Flat" }),
  S("Park Street Heritage Flat", "Historical", "Park Street, Kolkata", "Kolkata", 2900, 22.5535, 88.3520, 4.8, 15, { type: "Flat" }),
  S("Havelock Beach Villa", "Beach", "Havelock Island, Andaman", "Andaman", 6800, 11.9790, 92.9890, 4.9, 12, { maxGuests: 6 }),
  S("Naini Lake Cottage", "Lake", "Nainital, Uttarakhand", "Nainital", 3500, 29.3919, 79.4542, 4.7, 13, { type: "Cottage" }),
  S("Riverside Jungle Lodge", "Forest", "Jim Corbett, Uttarakhand", "Jim Corbett", 4200, 29.5300, 78.7747, 4.8, 10, { type: "Lodge" }),
];

module.exports = { listings, HOSTS };