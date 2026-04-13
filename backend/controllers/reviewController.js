// ── Review Controller ───────────────────────────────────────────────────────
// Handles request/response logic for review resources.
// Delegates data access to the Review model.

const ReviewModel = require('../models/Review');

// GET /api/reviews
// Returns the current user's reviews as JSON.
// NOTE: hardcoded to mock user "Alex J." until JWT auth is implemented.
const getReviews = (req, res) => {
  const reviews = ReviewModel.getAll();
  res.json(reviews);
};

module.exports = { getReviews };
