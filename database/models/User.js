const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  email:         { type: String, required: true, unique: true },
  passwordHash:  { type: String, required: true },
  role:          { type: String, enum: ['student', 'admin'], default: 'student' },
  avgRating:     { type: Number, default: 0 },
  totalReviews:  { type: Number, default: 0 },
  listings:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],  // listings this user posted
  bought:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],  // listings this user purchased
  favorites:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],  // listings this user saved
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
