const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true },
  description: { type: String },
  category:    { type: String },
  price:       { type: Number, required: true },
  condition:   { type: String, enum: ['new', 'like new', 'good', 'fair', 'poor'] },
  status:      { type: String, enum: ['available', 'sold', 'reserved'], default: 'available' },
  image_urls: [{
  url: { type: String, required: true },  // the S3 URL
  key: { type: String, required: true },  // S3 file key (needed to delete later)
}],
  tags:        [String],
  saved_by:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);
