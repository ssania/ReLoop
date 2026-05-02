// ── HousingReview Controller ─────────────────────────────────────────────────
// Handles request/response logic for housing-area reviews.
// Delegates data access to the HousingReview model.

const HousingReviewModel = require('../models/HousingReview');

// GET /api/housing/:areaId/reviews
// Returns the embedded housingReviews[] for a single housing area.
const getHousingReviews = (req, res) => {
  const reviews = HousingReviewModel.getByArea(req.params.areaId);
  if (reviews === null) return res.status(404).json({ message: 'Housing area not found' });
  res.json(reviews);
};

// POST /api/housing/:areaId/reviews
// Body: { reviewer: { name }, stars, comment }
// Validates stars (1–5) and a non-empty reviewer name, then appends the review
// to the area's embedded housingReviews[] and updates the area's aggregates.
// Responds 201 with { review, averageRating, reviewCount }.
const createHousingReview = (req, res) => {
  const { reviewer, stars, comment } = req.body || {};

  if (!reviewer || !reviewer.name) {
    return res.status(400).json({ message: 'reviewer.name is required' });
  }
  const starsNum = Number(stars);
  if (!Number.isFinite(starsNum) || starsNum < 1 || starsNum > 5) {
    return res.status(400).json({ message: 'stars must be a number between 1 and 5' });
  }

  const result = HousingReviewModel.create(req.params.areaId, {
    reviewer: { name: reviewer.name },
    stars:    starsNum,
    comment,
  });
  if (!result) return res.status(404).json({ message: 'Housing area not found' });

  res.status(201).json(result);
};

module.exports = { getHousingReviews, createHousingReview };
