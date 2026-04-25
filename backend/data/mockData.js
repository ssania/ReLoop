// ── Backend mock data ──────────────────────────────────────────────────────────
// Single source of truth for seed data while MongoDB is not yet connected.
// All field names and shapes exactly match the Mongoose schemas in database/models/
// so that replacing this file with real DB queries requires zero frontend changes,
// except for the imageUrls / floorPlanUrls fields (emojis are used as placeholders
// in the frontend until real S3 images are uploaded).
//
// Key conventions:
//   owner      – populated User shape { name, avgRating, email } (mirrors Mongoose populate)
//   createdAt  – ISO 8601 string (mirrors Mongoose timestamps)
//   imageUrls  – empty array until S3 upload is wired up

// ── Listings ──────────────────────────────────────────────────────────────────
// Mirrors: database/models/Listing.js
// owner is the populated User object: { name, avgRating, email }
// Frontend reads owner.name for the seller display, owner.avgRating for rating,
// and owner.email for the Contact Seller mailto link.

// ── Backend mock data ──────────────────────────────────────────────────────────

const initialListings = [
  {
    id: 1,
    owner:       { name: 'Maria Garcia', avgRating: 4.9, email: 'mgarcia@umass.edu' },
    title:       'IKEA KALLAX Shelf 4×4 – White',
    description: 'Perfect for dorm or apartment. Minor scratches on back panel only. Easy to disassemble for transport. Selling because graduating.',
    category:    'Furniture',
    price:       65,
    condition:   'Good',
    status:      'Available',
    imageUrls:   [],
    tags:        ['White', 'IKEA', 'Storage'],
    createdAt:   '2025-03-10T10:00:00.000Z',
    emoji:       '🛋️',
    ownedByUser: false,
  },
  {
    id: 2,
    owner:       { name: 'Dev Patel', avgRating: 5.0, email: 'dpatel@umass.edu' },
    title:       'MacBook Air M1 – 256GB Space Gray',
    description: '2021 M1 MacBook Air. Barely used – mostly stayed in bag. 256GB SSD, 8GB RAM. Original charger and box included. Battery health 97%.',
    category:    'Electronics',
    price:       750,
    condition:   'Like New',
    status:      'Available',
    imageUrls:   [],
    tags:        ['Apple', 'Laptop', 'M1'],
    createdAt:   '2025-03-05T14:30:00.000Z',
    emoji:       '💻',
    ownedByUser: false,
  },
  {
    id: 3,
    owner:       { name: 'Sam Lee', avgRating: 4.7, email: 'slee@umass.edu' },
    title:       'McMurry Organic Chemistry 12th Ed.',
    description: 'Highlighting in chapters 1–8 only. No torn pages. Perfect for CHEM 261. Selling because course is complete.',
    category:    'Textbooks',
    price:       45,
    condition:   'Good',
    status:      'Available',
    imageUrls:   [],
    tags:        ['CHEM 261', 'McMurry'],
    createdAt:   '2025-02-18T09:15:00.000Z',
    emoji:       '📚',
    ownedByUser: false,
  },
  {
    id: 4,
    owner:       { name: 'Jordan Torres', avgRating: 4.6, email: 'jtorres@umass.edu' },
    title:       'Mini Fridge 3.2 cu ft – Black',
    description: 'Works perfectly, just cleaned. Great for dorm rooms. Must pick up from North Apartments. No delivery available.',
    category:    'Appliances',
    price:       80,
    condition:   'Good',
    status:      'In-talk',
    imageUrls:   [],
    tags:        ['Dorm', 'Compact'],
    createdAt:   '2025-02-10T16:00:00.000Z',
    emoji:       '🍳',
    ownedByUser: false,
  },
  {
    id: 5,
    owner:       { name: 'Priya Kumar', avgRating: 4.8, email: 'pkumar@umass.edu' },
    title:       'LED Desk Lamp + 4-Port USB Hub',
    description: 'Adjustable color temperature, 4-port USB hub base. Used for one semester. Original box included.',
    category:    'Electronics',
    price:       20,
    condition:   'Like New',
    status:      'Available',
    imageUrls:   [],
    tags:        ['LED', 'USB', 'Study'],
    createdAt:   '2025-01-22T11:45:00.000Z',
    emoji:       '💻',
    ownedByUser: false,
  },
  {
    id: 6,
    owner:       { name: 'Chris Morgan', avgRating: 4.9, email: 'cmorgan@umass.edu' },
    title:       'Trek FX3 Hybrid Bike – Small',
    description: '2020 Trek FX3. Serviced and tuned last month. Great for campus commuting. Lights included.',
    category:    'Sports',
    price:       320,
    condition:   'Good',
    status:      'Available',
    imageUrls:   [],
    tags:        ['Trek', 'Bike', 'Campus'],
    createdAt:   '2025-01-15T08:30:00.000Z',
    emoji:       '🚴',
    ownedByUser: false,
  },
  {
    id: 7,
    owner:       { name: 'Lena Hayes', avgRating: 4.5, email: 'lhayes@umass.edu' },
    title:       'Queen Bed Frame + Upholstered Headboard',
    description: 'Solid wood queen frame with fabric headboard. Minor scuffs on the frame. No mattress included.',
    category:    'Furniture',
    price:       120,
    condition:   'Good',
    status:      'Available',
    imageUrls:   [],
    tags:        ['Queen', 'Bedroom'],
    createdAt:   '2024-12-20T13:00:00.000Z',
    emoji:       '🛋️',
    ownedByUser: false,
  },
  {
    id: 8,
    owner:       { name: 'Tom Rivera', avgRating: 4.4, email: 'trivera@umass.edu' },
    title:       'Stewart Calculus Early Trans. 8th Ed.',
    description: 'Lots of margin notes – great for study. Cover has wear. All pages intact.',
    category:    'Textbooks',
    price:       30,
    condition:   'Fair',
    status:      'Sold',
    imageUrls:   [],
    tags:        ['MATH', 'Calculus'],
    createdAt:   '2024-12-05T10:00:00.000Z',
    emoji:       '📚',
    ownedByUser: false,
  },
];

// ── Housing areas ──────────────────────────────────────────────────────────────

const housing = [
  {
    id: 101,
    emoji:         '🏙️',
    name:          'Downtown Amherst',
    type:          'Downtown',
    description:   'The most walkable neighborhood near UMass. Studios and 1BRs dominate.',
    distance:      0.5,   // ✅ FIXED
    rentMin:       800,
    rentMax:       1200,
    amenities:     ['Restaurants nearby', 'Walkable', 'Coffee shops', 'Public library', 'Grocery'],
    busRoutes:     ['PVTA #31'],
    imageUrls:     [],
    floorPlanUrls: [],
    coordinates:   { lat: 42.3732, lng: -72.5199 },
    averageRating: 4.3,
    reviewCount:   18,
    housingReviews: [
      { reviewer: { name: 'Grad Student' }, stars: 4, createdAt: '2025-01-12T00:00:00.000Z', comment: 'Best location if you like walking everywhere.' },
    ],
  },
  {
    id: 102,
    emoji:         '🏘️',
    name:          'North Amherst',
    type:          'Residential',
    description:   'Quiet residential streets with apartments and houses.',
    distance:      1.0,   // ✅ FIXED
    rentMin:       900,
    rentMax:       1600,
    amenities:     ['Grocery nearby', 'Quiet streets', 'Pet friendly', 'Parking available', 'Laundry'],
    busRoutes:     ['PVTA #30', 'PVTA #31'],
    imageUrls:     [],
    floorPlanUrls: [],
    coordinates:   { lat: 42.3901, lng: -72.5263 },
    averageRating: 4.5,
    reviewCount:   31,
    housingReviews: [
      { reviewer: { name: 'Junior, CS' }, stars: 5, createdAt: '2024-11-08T00:00:00.000Z', comment: 'Very quiet and safe neighborhood.' },
    ],
  },
  {
    id: 103,
    emoji:         '🏡',
    name:          'South Amherst',
    type:          'Houses',
    description:   'Spacious houses for groups of students.',
    distance:      1.5,   // ✅ FIXED
    rentMin:       2200,
    rentMax:       3400,
    amenities:     ['Backyard', 'Parking', 'Washer/Dryer', 'More space'],
    busRoutes:     ['PVTA #45'],
    imageUrls:     [],
    floorPlanUrls: [],
    coordinates:   { lat: 42.3512, lng: -72.5321 },
    averageRating: 4.7,
    reviewCount:   42,
    housingReviews: [
      { reviewer: { name: 'Group of 4' }, stars: 5, createdAt: '2024-05-20T00:00:00.000Z', comment: 'Huge house, great backyard.' },
    ],
  },
  {
    id: 104,
    emoji:         '🏢',
    name:          'Orchard Hill Area',
    type:          'Apartments',
    description:   'Very close to campus apartments.',
    distance:      0.4,   // ✅ FIXED
    rentMin:       1000,
    rentMax:       1400,
    amenities:     ['Close to campus', 'Furnished', 'Heat included'],
    busRoutes:     ['PVTA #33'],
    imageUrls:     [],
    floorPlanUrls: [],
    coordinates:   { lat: 42.3868, lng: -72.5312 },
    averageRating: 4.1,
    reviewCount:   14,
    housingReviews: [
      { reviewer: { name: 'Grad Student' }, stars: 4, createdAt: '2025-02-14T00:00:00.000Z', comment: 'Great location.' },
    ],
  },
  {
    id: 105,
    emoji:         '🏘️',
    name:          'Southeast Amherst',
    type:          'Townhouses',
    description:   'Townhouses and larger apartments.',
    distance:      1.2,   // ✅ FIXED
    rentMin:       2400,
    rentMax:       3000,
    amenities:     ['Garage', 'Patio', 'Washer/Dryer'],
    busRoutes:     ['PVTA #38'],
    imageUrls:     [],
    floorPlanUrls: [],
    coordinates:   { lat: 42.3621, lng: -72.5089 },
    averageRating: 4.5,
    reviewCount:   19,
    housingReviews: [
      { reviewer: { name: 'PhD Student' }, stars: 5, createdAt: '2025-03-02T00:00:00.000Z', comment: 'Great townhouse.' },
    ],
  },
  {
    id: 106,
    emoji:         '🏠',
    name:          'East Meadow',
    type:          'Budget',
    description:   'Affordable housing near campus.',
    distance:      1.0,   // ✅ FIXED
    rentMin:       700,
    rentMax:       950,
    amenities:     ['Heat included', 'Laundry', 'Parking'],
    busRoutes:     ['PVTA #31', 'PVTA #33'],
    imageUrls:     [],
    floorPlanUrls: [],
    coordinates:   { lat: 42.3745, lng: -72.5012 },
    averageRating: 3.8,
    reviewCount:   9,
    housingReviews: [
      { reviewer: { name: 'Undergrad' }, stars: 4, createdAt: '2024-11-20T00:00:00.000Z', comment: 'Good budget option.' },
    ],
  },
];

const myReviews = [
  {
    reviewer:   { name: 'Maria Garcia' },
    targetUser: { name: 'John Doe' },
    stars:      5,
    comment:    'Super easy transaction.',
    createdAt:  '2025-03-12T00:00:00.000Z',
  },
];

module.exports = { initialListings, housing, myReviews };