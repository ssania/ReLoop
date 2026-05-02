// ── Listing Model ────────────────────────────────────────────────────────────

// ============================================================
// SECTION 1 — MONGOOSE SCHEMA (used when MongoDB is connected)
// ============================================================
// To activate: uncomment connectDB() in server.js and swap
// each method body in Section 2 with its MongoDB version.

// ── Listing Model ────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true },
  description: { type: String },
  category:    { type: String },
  price:       { type: Number, required: true },
  condition:   { type: String, enum: ['New', 'Like New', 'Good', 'Fair'] },
  status:      { type: String, enum: ['Available', 'In-talk', 'Sold'], default: 'Available' },
  imageUrls:   [{ 
    url: { type: String, required: true }, 
    key: { type: String, required: true } 
  }],
  tags:        [String],
}, { timestamps: true });

const ListingMongoose = mongoose.model('Listing', listingSchema);

function normalize(doc) {
  if (!doc) return null;
  const obj = doc._id ? doc : doc;
  return { ...obj, id: obj._id.toString() };
}

const ListingModel = {

  // ✅ GET ALL LISTINGS
  async getAll() {
    const docs = await ListingMongoose.find({})
      .populate('owner', 'name avgRating email') // ✅ FIXED
      .sort({ createdAt: -1 })
      .lean();

    return docs.map(normalize);
  },

  // ✅ CREATE LISTING
  async create(data) {
    const doc = await ListingMongoose.create(data);

    const populated = await doc.populate('owner', 'name avgRating email'); // ✅ FIXED

    return normalize(populated.toObject());
  },

  // ✅ UPDATE LISTING
  async update(id, changes) {
    const doc = await ListingMongoose.findByIdAndUpdate(
      id,
      changes,
      { new: true }
    )
      .populate('owner', 'name avgRating email') // ✅ FIXED
      .lean();

    return normalize(doc);
  },

  // DELETE LISTING
  async remove(id) {
    const deleted = await ListingMongoose.findByIdAndDelete(id);
    return !!deleted;
  },
};

module.exports = ListingModel;
module.exports.ListingMongoose = ListingMongoose;