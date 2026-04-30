require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const { ListingMongoose: Listing } = require('./models/Listing');
const { HousingMongoose: HousingArea } = require('./models/Housing');
const { ReviewMongoose: Review } = require('./models/Review');
const HousingReview = require('./models/HousingReview');
const { housing: housingData, initialListings } = require('./data/mockData');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // ── Housing ──────────────────────────────────────────────────────────────────
  await HousingArea.deleteMany({});
  await HousingReview.deleteMany({});
  console.log('Cleared existing housing data');

  for (const h of housingData) {
    const { housingReviews, id, emoji, ...areaFields } = h;
    const area = await HousingArea.create(areaFields);

    if (housingReviews?.length) {
      let adminUser = await User.findOne({ email: 'admin@reloop.com' });
      if (!adminUser) {
        adminUser = await User.create({
          name:         'ReLoop Admin',
          email:        'admin@reloop.com',
          passwordHash: 'hashed_placeholder',
          role:         'admin',
        });
      }
      for (const r of housingReviews) {
        await HousingReview.create({ reviewer: adminUser._id, area: area._id, stars: r.stars, comment: r.comment });
      }
    }

    console.log(`Seeded housing: ${area.name}`);
  }

  // ── Listings ─────────────────────────────────────────────────────────────────
  await Listing.deleteMany({});
  await User.deleteMany({ role: 'student' });
  console.log('Cleared existing listings and student users');

  // Create 4 mock users + John Doe (default owner for new UI-created listings)
  const [johnDoe, alice, bob, carol, dan] = await User.insertMany([
    { name: 'John Doe',    email: 'john.doe@reloop.com',    passwordHash: 'hashed_placeholder', avgRating: 5.0, role: 'student' },
    { name: 'Alice Chen',  email: 'alice.chen@reloop.com',  passwordHash: 'hashed_placeholder', avgRating: 4.9, role: 'student' },
    { name: 'Bob Nguyen',  email: 'bob.nguyen@reloop.com',  passwordHash: 'hashed_placeholder', avgRating: 4.7, role: 'student' },
    { name: 'Carol Smith', email: 'carol.smith@reloop.com', passwordHash: 'hashed_placeholder', avgRating: 4.8, role: 'student' },
    { name: 'Dan Park',    email: 'dan.park@reloop.com',    passwordHash: 'hashed_placeholder', avgRating: 4.6, role: 'student' },
  ]);
  console.log('Created mock users: John Doe, Alice Chen, Bob Nguyen, Carol Smith, Dan Park');

  // Distribute listings across the 4 mock users (2 each)
  const ownerCycle = [alice, alice, bob, bob, carol, carol, dan, dan];

  for (let i = 0; i < initialListings.length; i++) {
    const { id, emoji, ownedByUser, owner, createdAt, ...listingFields } = initialListings[i];
    await Listing.create({ ...listingFields, owner: ownerCycle[i]._id });
    console.log(`Seeded listing: ${initialListings[i].title}`);
  }

  console.log('Seed complete.');
  await mongoose.disconnect();
}

seed().catch(console.error);
