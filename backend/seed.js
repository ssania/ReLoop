// ── seed.js ───────────────────────────────────────────────────────────────────
// Wipes the entire database and reseeds only housing data.
// Users and listings are created via the app.
//
// Usage: node backend/seed.js

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose      = require('mongoose');
const User          = require('./models/User');
const { ListingMongoose: Listing }     = require('./models/Listing');
const { ReviewMongoose: Review }       = require('./models/Review');
const { HousingMongoose: HousingArea } = require('./models/Housing');
const HousingReview                    = require('./models/HousingReview');
const { housing: housingData }         = require('./data/mockData');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await Promise.all([
    Review.deleteMany({}),
    Listing.deleteMany({}),
    User.deleteMany({}),
    HousingReview.deleteMany({}),
    HousingArea.deleteMany({}),
  ]);
  console.log('Cleared all collections');

  for (const h of housingData) {
    const { housingReviews, id, emoji, ...areaFields } = h;
    const area = await HousingArea.create(areaFields);
    console.log(`  ✓ ${area.name}`);
  }

  console.log('\nDone. Register a new account to start using the app.');
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
