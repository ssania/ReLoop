const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true },
  description: { type: String },
  category:    { type: String },
  price:       { type: Number, required: true },
  condition:   { type: String, enum: ['new', 'like new', 'good', 'fair', 'poor'] },
  status:      { type: String, enum: ['available', 'sold', 'reserved'], default: 'available' },
  image_urls:  [String],
  tags:        [String],
  saved_by:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);
