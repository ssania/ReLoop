const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  email:         { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role:          { type: String, enum: ['student', 'admin'], default: 'student' },
  avg_rating:    { type: Number, default: 0 },
  total_reviews: { type: Number, default: 0 },
  saved_listings:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
