// ── Housing Model ────────────────────────────────────────────────────────────

// ============================================================
// SECTION 1 — MONGOOSE SCHEMA (used when MongoDB is connected)
// ============================================================

const mongoose = require('mongoose');

const housingAreaSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  type:          { type: String },
  description:   { type: String },
  distance:      { type: String },
  rentMin:       { type: Number },
  rentMax:       { type: Number },
  amenities:     [String],
  busRoutes:     [String],
  imageUrls:     [{ url: { type: String, required: true }, key: { type: String, required: true } }],
  floorPlanUrls: [{ url: { type: String, required: true }, key: { type: String, required: true } }],
  coordinates:   { lat: Number, lng: Number },
  averageRating: { type: Number, default: 0 },
  reviewCount:   { type: Number, default: 0 },
}, { timestamps: true });

// Exported so seed.js can use it directly.
const HousingMongoose = mongoose.model('HousingArea', housingAreaSchema);

// ============================================================
// SECTION 2 — MOCK WRAPPER (active while MongoDB is not connected)
// ============================================================

const { housing } = require('../data/mockData');

const HousingModel = {
  // MongoDB: return HousingMongoose.find({});
  getAll() {
    return housing;
  },
};

module.exports = HousingModel;
module.exports.HousingMongoose = HousingMongoose;
