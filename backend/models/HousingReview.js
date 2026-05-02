// ── HousingReview Model ──────────────────────────────────────────────────────

// ============================================================
// SECTION 1 — MONGOOSE SCHEMA (used when MongoDB is connected)
// ============================================================

const mongoose = require('mongoose');

const housingReviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  area:     { type: mongoose.Schema.Types.ObjectId, ref: 'HousingArea', required: true },
  stars:    { type: Number, min: 1, max: 5, required: true },
  comment:  { type: String },
}, { timestamps: true });

const HousingReviewMongoose = mongoose.model('HousingReview', housingReviewSchema);

// ============================================================
// SECTION 2 — MOCK WRAPPER (active while MongoDB is not connected)
// ============================================================
// Reviews are embedded in each housing area's housingReviews[] array in
// mockData.js. The wrapper mutates that embedded array and recomputes
// the parent area's averageRating + reviewCount on every create so the
// next GET /api/housing reflects the new totals.

const { housing } = require('../data/mockData');

function findArea(areaId) {
  const id = parseInt(areaId, 10);
  return housing.find(h => h.id === id);
}

const HousingReviewModel = {
  // MongoDB:
  //   return HousingReviewMongoose
  //     .find({ area: areaId })
  //     .populate('reviewer', 'name')
  //     .sort({ createdAt: -1 });
  getByArea(areaId) {
    const area = findArea(areaId);
    return area ? area.housingReviews : null;
  },

  // MongoDB:
  //   const review = await new HousingReviewMongoose({ ...data, area: areaId }).save();
  //   const stats = await HousingReviewMongoose.aggregate([
  //     { $match: { area: review.area } },
  //     { $group: { _id: '$area', avg: { $avg: '$stars' }, count: { $sum: 1 } } },
  //   ]);
  //   await HousingArea.findByIdAndUpdate(areaId, {
  //     averageRating: stats[0].avg,
  //     reviewCount:   stats[0].count,
  //   });
  //   return review.populate('reviewer', 'name');
  create(areaId, data) {
    const area = findArea(areaId);
    if (!area) return null;

    const review = {
      reviewer:  data.reviewer,            // populated User shape { name } in mock mode
      stars:     data.stars,
      comment:   data.comment || '',
      createdAt: new Date().toISOString(),
    };

    // Newest review first so the modal's review list shows it at the top.
    area.housingReviews = [review, ...area.housingReviews];

    // Recompute aggregates on the parent area.
    const totalStars = area.housingReviews.reduce((sum, r) => sum + r.stars, 0);
    area.reviewCount   = area.housingReviews.length;
    area.averageRating = +(totalStars / area.reviewCount).toFixed(1);

    return {
      review,
      averageRating: area.averageRating,
      reviewCount:   area.reviewCount,
    };
  },
};

module.exports = HousingReviewModel;
module.exports.HousingReviewMongoose = HousingReviewMongoose;
