// ── HousingReview Model ──────────────────────────────────────────────────────

// ============================================================
// SECTION 1 — MONGOOSE SCHEMA (used when MongoDB is connected)
// ============================================================

const mongoose = require('mongoose');

const housingReviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  area:     { type: mongoose.Schema.Types.ObjectId, ref: 'HousingArea', required: true },
  stars:    { type: Number, min: 1, max: 5, required: true },
  comment:  { type: String },
}, { timestamps: true });

module.exports = mongoose.model('HousingReview', housingReviewSchema);

// ============================================================
// SECTION 2 — MOCK WRAPPER
// ============================================================
// No mock wrapper needed — HousingReviews are embedded directly
// inside each housing area object in mockData.js (housingReviews[]).
// When MongoDB is connected, HousingReview.find({ area: id })
// .populate('reviewer', 'name') will replace the embedded array.
