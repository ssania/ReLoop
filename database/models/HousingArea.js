const mongoose = require('mongoose');

const housingAreaSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  type:          { type: String },
  description:   { type: String },
  distance:      { type: String },                // e.g. "0.3 – 0.8 mi from campus"
  rentMin:       { type: Number },
  rentMax:       { type: Number },
  amenities:     [String],
  busRoutes:     [String],                        // PVTA route strings e.g. "PVTA #31"
  imageUrls:     [{ url: { type: String, required: true }, key: { type: String, required: true } }],
  floorPlanUrls: [{ url: { type: String, required: true }, key: { type: String, required: true } }],
  coordinates:   { lat: Number, lng: Number },
  averageRating: { type: Number, default: 0 },
  reviewCount:   { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('HousingArea', housingAreaSchema);
