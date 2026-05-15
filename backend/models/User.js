// ── User Model ───────────────────────────────────────────────────────────────
// ============================================================
// SECTION 1 — MONGOOSE SCHEMA (used when MongoDB is connected)
// ============================================================
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:              { type: String, required: true },
  email:             { type: String, required: true, unique: true },
  passwordHash:      { type: String, required: true },
  role:              { type: String, enum: ['student', 'admin'], default: 'student' },
  avgRating:         { type: Number, default: 0 },
  totalReviews:      { type: Number, default: 0 },
  listings:          [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
  bought:            [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
  favorites:         [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],

  // ── Email verification fields ─────────────────────────────
  // verified: false until the user clicks the link in their @umass.edu inbox.
  // verificationToken: a random string emailed to them; cleared once verified.
  verified:           { type: Boolean, default: false },
  verificationToken:  { type: String, default: null },

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

// ============================================================
// SECTION 2 — MOCK WRAPPER
// ============================================================
// No mock wrapper needed — User is not yet exposed via any API route.
// Auth routes (register / login) use the Mongoose model directly.