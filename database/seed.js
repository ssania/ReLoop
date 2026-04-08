require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Listing = require('./models/Listing');
const HousingArea = require('./models/HousingArea');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear old data
  await User.deleteMany({});
  await Listing.deleteMany({});
  await HousingArea.deleteMany({});

  // Create sample users
  const user1 = await User.create({
    name: 'Alex Smith',
    email: 'asmith@umass.edu',
    password_hash: 'hashed_password_here',
    role: 'student'
  });

  // Create sample listing
  await Listing.create({
    owner: user1._id,
    title: 'IKEA Desk - Great Condition',
    description: 'Moving out, selling my desk. Barely used.',
    category: 'Furniture',
    price: 45,
    condition: 'like new',
    tags: ['desk', 'furniture', 'ikea']
  });

  // Create sample housing area
  await HousingArea.create({
    name: 'North Apartments',
    type: 'On-campus',
    description: 'On-campus housing north of the library.',
    rent_min: 800,
    rent_max: 1200,
    amenities: ['laundry', 'wifi', 'parking'],
    bus_routes: ['31', '38']
  });

  console.log('Seed data inserted!');
  await mongoose.disconnect();
}

seed().catch(console.error);
