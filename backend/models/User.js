// ── User Model ───────────────────────────────────────────────────────────────

// ============================================================
// SECTION 1 — MONGOOSE SCHEMA (used when MongoDB is connected)
// ============================================================

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role:         { type: String, enum: ['student', 'admin'], default: 'student' },
  avgRating:    { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  listings:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],  // listings posted
  bought:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],  // listings purchased
  favorites:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],  // listings saved
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

// ============================================================
// SECTION 2 — MOCK WRAPPER
// ============================================================
// No mock wrapper needed — User is not yet exposed via any API route.
// Auth routes (register / login) will use the Mongoose model directly
// once JWT auth is implemented.
