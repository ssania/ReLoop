// ── Review Model ────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  stars:      { type: Number, min: 1, max: 5, required: true },
  comment:    { type: String, default: '' },
}, { timestamps: true });

// One review per buyer per listing — prevents duplicate submissions
reviewSchema.index({ reviewer: 1, listingRef: 1 }, { unique: true });

const ReviewMongoose = mongoose.model('Review', reviewSchema);

module.exports = ReviewMongoose;
module.exports.ReviewMongoose = ReviewMongoose;
