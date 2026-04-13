// ── Listing Model ────────────────────────────────────────────────────────────

// ============================================================
// SECTION 1 — MONGOOSE SCHEMA (used when MongoDB is connected)
// ============================================================
// To activate: uncomment connectDB() in server.js and swap
// each method body in Section 2 with its MongoDB version.

const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true },
  description: { type: String },
  category:    { type: String },
  price:       { type: Number, required: true },
  condition:   { type: String, enum: ['New', 'Like New', 'Good', 'Fair'] },
  status:      { type: String, enum: ['Available', 'In-talk', 'Sold'], default: 'Available' },
  imageUrls:   [{ url: { type: String, required: true }, key: { type: String, required: true } }],
  tags:        [String],
}, { timestamps: true });

// Exported so seed.js can use it directly.
const ListingMongoose = mongoose.model('Listing', listingSchema);

// ============================================================
// SECTION 2 — MOCK WRAPPER (active while MongoDB is not connected)
// ============================================================
// Controllers call these methods. Swap the bodies to MongoDB
// versions (shown in comments) when the DB is connected.

const { initialListings } = require('../data/mockData');

let listings = [...initialListings];

const ListingModel = {
  // MongoDB: return ListingMongoose.find({}).populate('owner', 'name avgRating');
  getAll() {
    return listings;
  },

  // MongoDB: return new ListingMongoose(data).save();
  create(data) {
    const newId = listings.length > 0 ? Math.max(...listings.map(l => l.id)) + 1 : 1;
    const newListing = { ...data, id: newId };
    listings = [newListing, ...listings];
    return newListing;
  },

  // MongoDB: return ListingMongoose.findByIdAndDelete(id);
  remove(id) {
    const before = listings.length;
    listings = listings.filter(l => l.id !== id);
    return listings.length < before;
  },
};

module.exports = ListingModel;
module.exports.ListingMongoose = ListingMongoose;
