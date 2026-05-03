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

function recomputeAggregates(area) {
  const totalStars = area.housingReviews.reduce((sum, r) => sum + r.stars, 0);
  area.reviewCount   = area.housingReviews.length;
  area.averageRating = area.reviewCount > 0 ? +(totalStars / area.reviewCount).toFixed(1) : 0;
}

const HousingReviewModel = {
  getByArea(areaId) {
    const area = findArea(areaId);
    return area ? area.housingReviews : null;
  },

  create(areaId, data) {
    const area = findArea(areaId);
    if (!area) return null;

    const review = {
      id:          Date.now(),
      reviewerId:  data.reviewerId,
      reviewer:    { name: data.reviewerName },
      stars:       data.stars,
      comment:     data.comment || '',
      createdAt:   new Date().toISOString(),
    };

    area.housingReviews = [review, ...area.housingReviews];
    recomputeAggregates(area);

    return { review, averageRating: area.averageRating, reviewCount: area.reviewCount };
  },

  update(areaId, reviewId, userId, data) {
    const area = findArea(areaId);
    if (!area) return { error: 'not_found' };

    const review = area.housingReviews.find(r => r.id === reviewId);
    if (!review) return { error: 'not_found' };
    if (review.reviewerId !== userId) return { error: 'forbidden' };

    if (data.stars !== undefined)   review.stars   = data.stars;
    if (data.comment !== undefined) review.comment = data.comment;
    recomputeAggregates(area);

    return { review, averageRating: area.averageRating, reviewCount: area.reviewCount };
  },

  remove(areaId, reviewId, userId) {
    const area = findArea(areaId);
    if (!area) return { error: 'not_found' };

    const idx = area.housingReviews.findIndex(r => r.id === reviewId);
    if (idx === -1) return { error: 'not_found' };
    if (area.housingReviews[idx].reviewerId !== userId) return { error: 'forbidden' };

    area.housingReviews.splice(idx, 1);
    recomputeAggregates(area);

    return { averageRating: area.averageRating, reviewCount: area.reviewCount };
  },
};

module.exports = HousingReviewModel;
module.exports.HousingReviewMongoose = HousingReviewMongoose;
