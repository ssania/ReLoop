// ── Backend mock data ──────────────────────────────────────────────────────────
// This is the single source of truth for seed data while MongoDB is not yet
// connected. When MongoDB is wired up, replace these arrays with Mongoose
// model queries (e.g. Listing.find({})) and delete this file.

const initialListings = [
  {
    id: 1, emoji: '🛋️', cat: 'Furniture',
    title: 'IKEA KALLAX Shelf 4×4 – White',
    price: 65, cond: 'Good', status: 'Available',
    desc: 'Perfect for dorm or apartment. Minor scratches on back panel only. Easy to disassemble for transport. Selling because graduating.',
    seller: 'Maria G.', init: 'MG', rating: 4.9,
    tags: ['White', 'IKEA', 'Storage'], posted: 'March 2025',
  },
  {
    id: 2, emoji: '💻', cat: 'Electronics',
    title: 'MacBook Air M1 – 256GB Space Gray',
    price: 750, cond: 'Like New', status: 'Available',
    desc: '2021 M1 MacBook Air. Barely used – mostly stayed in bag. 256GB SSD, 8GB RAM. Original charger and box included. Battery health 97%.',
    seller: 'Dev P.', init: 'DP', rating: 5.0,
    tags: ['Apple', 'Laptop', 'M1'], posted: 'March 2025',
  },
  {
    id: 3, emoji: '📚', cat: 'Textbooks',
    title: 'McMurry Organic Chemistry 12th Ed.',
    price: 45, cond: 'Good', status: 'Available',
    desc: 'Highlighting in chapters 1–8 only. No torn pages. Perfect for CHEM 261. Selling because course is complete.',
    seller: 'Sam L.', init: 'SL', rating: 4.7,
    tags: ['CHEM 261', 'McMurry'], posted: 'Feb 2025',
  },
  {
    id: 4, emoji: '🍳', cat: 'Appliances',
    title: 'Mini Fridge 3.2 cu ft – Black',
    price: 80, cond: 'Good', status: 'In-talk',
    desc: 'Works perfectly, just cleaned. Great for dorm rooms. Must pick up from North Apartments. No delivery available.',
    seller: 'Jordan T.', init: 'JT', rating: 4.6,
    tags: ['Dorm', 'Compact'], posted: 'Feb 2025',
  },
  {
    id: 5, emoji: '💻', cat: 'Electronics',
    title: 'LED Desk Lamp + 4-Port USB Hub',
    price: 20, cond: 'Like New', status: 'Available',
    desc: 'Adjustable color temperature, 4-port USB hub base. Used for one semester. Original box included.',
    seller: 'Priya K.', init: 'PK', rating: 4.8,
    tags: ['LED', 'USB', 'Study'], posted: 'Jan 2025',
  },
  {
    id: 6, emoji: '🚴', cat: 'Sports',
    title: 'Trek FX3 Hybrid Bike – Small',
    price: 320, cond: 'Good', status: 'Available',
    desc: '2020 Trek FX3. Serviced and tuned last month. Great for campus commuting. Lights included.',
    seller: 'Chris M.', init: 'CM', rating: 4.9,
    tags: ['Trek', 'Bike', 'Campus'], posted: 'Jan 2025',
  },
  {
    id: 7, emoji: '🛋️', cat: 'Furniture',
    title: 'Queen Bed Frame + Upholstered Headboard',
    price: 120, cond: 'Good', status: 'Available',
    desc: 'Solid wood queen frame with fabric headboard. Minor scuffs on the frame. No mattress included.',
    seller: 'Lena H.', init: 'LH', rating: 4.5,
    tags: ['Queen', 'Bedroom'], posted: 'Dec 2024',
  },
  {
    id: 8, emoji: '📚', cat: 'Textbooks',
    title: 'Stewart Calculus Early Trans. 8th Ed.',
    price: 30, cond: 'Fair', status: 'Sold',
    desc: 'Lots of margin notes – great for study. Cover has wear. All pages intact.',
    seller: 'Tom R.', init: 'TR', rating: 4.4,
    tags: ['MATH', 'Calculus'], posted: 'Dec 2024',
  },
];

const housing = [
  {
    id: 101, emoji: '🏙️', type: 'Downtown',
    name: 'Downtown Amherst', dist: '0.3 – 0.8 mi from campus',
    rentMin: 800, rentMax: 1200,
    desc: 'The most walkable neighborhood near UMass. Studios and 1BRs dominate. Close to restaurants, coffee shops, and the Amherst town center. High demand – book early.',
    amenities: ['Restaurants nearby', 'Walkable', 'Coffee shops', 'Public library', 'Grocery'],
    bus: ['PVTA #31'], walk: '5–15 min', rating: 4.3, reviews: 18,
    floorPlans: ['Studio (350–500 sqft)', '1 Bedroom (550–750 sqft)'],
    reviews_list: [{ author: 'Grad student', stars: 4, date: 'Jan 2025', text: 'Best location if you like walking everywhere. A bit noisy on weekends but incredibly convenient.' }],
  },
  {
    id: 102, emoji: '🏘️', type: 'Residential',
    name: 'North Amherst', dist: '0.5 – 1.2 mi from campus',
    rentMin: 900, rentMax: 1600,
    desc: 'Quiet residential streets with a mix of apartments and small houses. Two PVTA routes connect directly to campus. Very popular with upperclassmen and grad students.',
    amenities: ['Grocery nearby', 'Quiet streets', 'Pet friendly', 'Parking available', 'Laundry'],
    bus: ['PVTA #30', 'PVTA #31'], walk: '10–20 min', rating: 4.5, reviews: 31,
    floorPlans: ['1 Bedroom (550–800 sqft)', '2 Bedroom (850–1,100 sqft)'],
    reviews_list: [{ author: 'Junior, CS', stars: 5, date: 'Nov 2024', text: 'Really quiet and safe neighborhood. Bus is reliable and runs every 15 min during peak hours.' }],
  },
  {
    id: 103, emoji: '🏡', type: 'Houses',
    name: 'South Amherst', dist: '1.0 – 2.5 mi from campus',
    rentMin: 2200, rentMax: 3400,
    desc: 'Spacious houses with yards, perfect for groups of 3–4 students. More space per person than downtown. Requires a car or reliable bus access. Near Hampshire College.',
    amenities: ['Backyard', 'Parking', 'Washer/Dryer', 'More space', 'Near Hampshire'],
    bus: ['PVTA #45'], walk: '25–40 min', rating: 4.7, reviews: 42,
    floorPlans: ['3 Bedroom house (1,200–1,600 sqft)', '4 Bedroom house (1,500–2,000 sqft)'],
    reviews_list: [{ author: 'Group of 4', stars: 5, date: 'May 2024', text: 'Huge house, great backyard. Worth the commute for the space and price per person.' }],
  },
  {
    id: 104, emoji: '🏢', type: 'Apartments',
    name: 'Orchard Hill Area', dist: '0.2 – 0.6 mi from campus',
    rentMin: 1000, rentMax: 1400,
    desc: 'Very close to central campus. Mix of 1BR and 2BR apartments. Many come furnished. Popular with solo grad students and couples. Quiet building environments.',
    amenities: ['Close to campus', 'Often furnished', 'Heat included', 'Shared laundry'],
    bus: ['PVTA #33'], walk: '5–10 min', rating: 4.1, reviews: 14,
    floorPlans: ['1 Bedroom (500–700 sqft)', '2 Bedroom (700–950 sqft)'],
    reviews_list: [{ author: 'Grad student', stars: 4, date: 'Feb 2025', text: 'Perfect location for anyone who wants to walk to campus. Apartments are small but modern.' }],
  },
  {
    id: 105, emoji: '🏘️', type: 'Townhouses',
    name: 'Southeast Amherst', dist: '1.0 – 2.0 mi from campus',
    rentMin: 2400, rentMax: 3000,
    desc: 'Townhouses and larger apartments. Quieter residential area popular with grad students and families. Good value for the space. Attached garages common.',
    amenities: ['Attached garage', 'Private patio', 'Washer/Dryer', 'Central AC', 'Updated kitchens'],
    bus: ['PVTA #38'], walk: '20–35 min', rating: 4.5, reviews: 19,
    floorPlans: ['2 Bedroom townhouse (900–1,200 sqft)', '3 Bedroom townhouse (1,200–1,600 sqft)'],
    reviews_list: [{ author: 'PhD student', stars: 5, date: 'Mar 2025', text: 'Great value for a townhouse. The garage is fantastic in winter. Very quiet area.' }],
  },
  {
    id: 106, emoji: '🏠', type: 'Budget',
    name: 'East Meadow', dist: '0.8 – 1.5 mi from campus',
    rentMin: 700, rentMax: 950,
    desc: 'Most affordable area near campus. Basic amenities but well-maintained. Heat and hot water typically included. Great for students on a tight budget.',
    amenities: ['Heat & hot water incl.', 'Coin laundry', 'On-street parking', 'Budget-friendly'],
    bus: ['PVTA #31', 'PVTA #33'], walk: '15–25 min', rating: 3.8, reviews: 9,
    floorPlans: ['Studio (280–400 sqft)', '1 Bedroom (400–600 sqft)'],
    reviews_list: [{ author: 'Undergrad', stars: 4, date: 'Nov 2024', text: 'You get what you pay for. Clean and safe, nothing fancy. Heat included saves a lot.' }],
  },
];

const myReviews = [
  { from: 'Maria G.', init: 'MG', stars: 5, text: 'Super easy transaction. Item exactly as described. Very responsive and friendly.', date: 'March 2025' },
  { from: 'Dev P.', init: 'DP', stars: 5, text: 'Great seller – very responsive. Item was in perfect condition.', date: 'Feb 2025' },
  { from: 'Sam L.', init: 'SL', stars: 4, text: 'Good transaction, showed up on time. Item matched the photos.', date: 'Jan 2025' },
];

module.exports = { initialListings, housing, myReviews };
