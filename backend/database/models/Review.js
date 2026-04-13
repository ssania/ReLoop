const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetUser:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingRef:  { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  stars:       { type: Number, min: 1, max: 5, required: true },
  comment:     { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
