const mongoose = require('mongoose');

const housingAreaSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  type:        { type: String },
  description: { type: String },
  rent_min:    { type: Number },
  rent_max:    { type: Number },
  amenities:   [String],
  bus_routes:  [String],
  image_urls: [{
  url: { type: String, required: true },
  key: { type: String, required: true },
}],

floor_plan_urls: [{
  url: { type: String, required: true },
  key: { type: String, required: true },
}],
  coordinates: { lat: Number, lng: Number },
  avg_rating:  { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('HousingArea', housingAreaSchema);
