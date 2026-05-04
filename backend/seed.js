// ── seed.js ───────────────────────────────────────────────────────────────────
// Reseeds only housing areas and their reviews.
// Users, listings, and reviews are left untouched.
//
// Usage: node backend/seed.js

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose      = require('mongoose');
const { HousingMongoose: HousingArea } = require('./models/Housing');
const { housing: housingData }         = require('./data/mockData');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const { HousingReviewMongoose } = require('./models/HousingReview');
  await HousingReviewMongoose.deleteMany({});
  await HousingArea.deleteMany({});
  console.log('Cleared housing areas and reviews');

  for (const h of housingData) {
    const { housingReviews, id, emoji, ...areaFields } = h;
    const area = await HousingArea.create(areaFields);
    console.log(`  ✓ ${area.name}`);
  }

  console.log('\nDone. Users, listings, and reviews are untouched.');
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
