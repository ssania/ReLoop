// ── Review Model ────────────────────────────────────────────────────────────

// ============================================================
// SECTION 1 — MONGOOSE SCHEMA (used when MongoDB is connected)
// ============================================================

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  stars:      { type: Number, min: 1, max: 5, required: true },
  comment:    { type: String },
}, { timestamps: true });

// Exported so seed.js can use it directly.
const ReviewMongoose = mongoose.model('Review', reviewSchema);

// ============================================================
// SECTION 2 — MOCK WRAPPER (active while MongoDB is not connected)
// ============================================================

const { myReviews } = require('../data/mockData');

const ReviewModel = {
  // MongoDB: return ReviewMongoose.find({ targetUser: req.user._id }).populate('reviewer', 'name');
  getAll() {
    return myReviews;
  },
};

module.exports = ReviewModel;
module.exports.ReviewMongoose = ReviewMongoose;
