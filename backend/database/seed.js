require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Listing = require('./models/Listing');
const HousingArea = require('./models/HousingArea');
const Review = require('./models/Review');
const HousingReview = require('./models/HousingReview');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear old data
  await User.deleteMany({});
  await Listing.deleteMany({});
  await HousingArea.deleteMany({});
  await Review.deleteMany({});
  await HousingReview.deleteMany({});

  // Create sample users
  const user1 = await User.create({
    name: 'Alex Smith',
    email: 'asmith@umass.edu',
    passwordHash: 'hashed_password_here',
    role: 'student'
  });

  const user2 = await User.create({
    name: 'Sara Jones',
    email: 'sjones@umass.edu',
    passwordHash: 'hashed_password_here',
    role: 'student'
  });

  // Create sample listing
  const listing1 = await Listing.create({
    owner: user1._id,
    title: 'IKEA Desk - Great Condition',
    description: 'Moving out, selling my desk. Barely used.',
    category: 'Furniture',
    price: 45,
    condition: 'Like New',
    tags: ['desk', 'furniture', 'ikea']
  });

  // Create sample housing area
  const area1 = await HousingArea.create({
    name: 'North Apartments',
    type: 'On-campus',
    description: 'On-campus housing north of the library.',
    distance: '0.2 – 0.5 mi from campus',
    rentMin: 800,
    rentMax: 1200,
    amenities: ['laundry', 'wifi', 'parking'],
    busRoutes: ['PVTA #31', 'PVTA #38']
  });

  // Create sample review (user2 reviews user1 after a transaction)
  await Review.create({
    reviewer: user2._id,
    targetUser: user1._id,
    listingRef: listing1._id,
    stars: 5,
    comment: 'Great seller, item was exactly as described!'
  });

  // Create sample housing review
  await HousingReview.create({
    reviewer: user1._id,
    area: area1._id,
    stars: 4,
    comment: 'Great location, close to campus and bus stops.',
  });

  console.log('Seed data inserted!');
  await mongoose.disconnect();
}

seed().catch(console.error);
