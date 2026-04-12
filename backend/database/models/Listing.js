const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true },
  description: { type: String },
  category:    { type: String },
  price:       { type: Number, required: true },
  condition:   { type: String, enum: ['New', 'Like New', 'Good', 'Fair'] },
  status:      { type: String, enum: ['Available', 'In-talk', 'Sold'], default: 'Available' },
  imageUrls: [{
    url: { type: String, required: true },  // the S3 URL
    key: { type: String, required: true },  // S3 file key (needed to delete later)
  }],
  tags:        [String],
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);
