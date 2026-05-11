// ── Housing Model ────────────────────────────────────────────────────────────

// ============================================================
// SECTION 1 — MONGOOSE SCHEMA (used when MongoDB is connected)
// ============================================================

const mongoose = require('mongoose');

const housingAreaSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  type:          { type: String },
  description:   { type: String },
  distance:      { type: Number },
  rentMin:       { type: Number },
  rentMax:       { type: Number },
  amenities:     [String],
  busRoutes:     [String],
  imageUrls:     [{ url: { type: String, required: true }, key: { type: String, required: true } }],
  floorPlans:    [{
    layout:      { type: String, required: true },
    sqft:        { type: Number },
    description: { type: String, default: '' },
    imageUrl:    { type: String, default: '' },
    imageKey:    { type: String, default: '' },
  }],
  coordinates:   { lat: Number, lng: Number },
  mapEmbedUrl:   { type: String, default: '' },
  averageRating: { type: Number, default: 0 },
  reviewCount:   { type: Number, default: 0 },
  contact:       {
    phone:   { type: String, default: '' },
    email:   { type: String, default: '' },
    website: { type: String, default: '' },
    address: { type: String, default: '' },
  },
}, { timestamps: true });

// Exported so seed.js can use it directly.
const HousingMongoose = mongoose.model('HousingArea', housingAreaSchema);

const HousingModel = {
  async getAll() {
    const areas = await HousingMongoose.find({}).lean();
    const { HousingReviewMongoose } = require('./HousingReview');
    const reviews = await HousingReviewMongoose.find({})
      .populate('reviewer', 'name')
      .lean();

    // attach reviews to their area as housingReviews[]
    const reviewsByArea = {};
    for (const r of reviews) {
      const key = r.area.toString();
      if (!reviewsByArea[key]) reviewsByArea[key] = [];
      reviewsByArea[key].push({
        id:         r._id.toString(),
        reviewerId: r.reviewer?._id?.toString(),
        reviewer:   { name: r.reviewer?.name ?? 'Anonymous' },
        stars:      r.stars,
        comment:    r.comment,
        createdAt:  r.createdAt,
      });
    }

    return areas.map(a => ({
      ...a,
      id: a._id,
      housingReviews: reviewsByArea[a._id.toString()] ?? [],
    }));
  },
};

module.exports = HousingModel;
module.exports.HousingMongoose = HousingMongoose;
