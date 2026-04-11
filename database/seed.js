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
    password_hash: 'hashed_password_here',
    role: 'student'
  });

  const user2 = await User.create({
    name: 'Sara Jones',
    email: 'sjones@umass.edu',
    password_hash: 'hashed_password_here',
    role: 'student'
  });

  // Create sample listing
  const listing1 = await Listing.create({
    owner: user1._id,
    title: 'IKEA Desk - Great Condition',
    description: 'Moving out, selling my desk. Barely used.',
    category: 'Furniture',
    price: 45,
    condition: 'like new',
    tags: ['desk', 'furniture', 'ikea']
  });

  // Create sample housing area
  const area1 = await HousingArea.create({
    name: 'North Apartments',
    type: 'On-campus',
    description: 'On-campus housing north of the library.',
    rent_min: 800,
    rent_max: 1200,
    amenities: ['laundry', 'wifi', 'parking'],
    bus_routes: ['31', '38']
  });

  // Create sample review (user2 reviews user1 after a transaction)
  await Review.create({
    reviewer: user2._id,
    target_user: user1._id,
    listing_ref: listing1._id,
    stars: 5,
    comment: 'Great seller, item was exactly as described!'
  });

  // Create sample housing review
  await HousingReview.create({
    reviewer: user1._id,
    area: area1._id,
    stars: 4,
    comment: 'Great location, close to campus and bus stops.',
    tenant_period: 'Fall 2023 - Spring 2024'
  });

  console.log('Seed data inserted!');
  await mongoose.disconnect();
}

seed().catch(console.error);
