// ── Review Model ────────────────────────────────────────────────────────────
// Owns the reviews data.
// When auth is added, filter by user id instead of returning all reviews.
// When MongoDB is connected we will replace with: Review.find({ userId: req.user._id })

const { myReviews } = require('../data/mockData');

const ReviewModel = {
  // Return all reviews (currently hardcoded to mock user "Alex J.")
  getAll() {
    return myReviews;
  },
};

module.exports = ReviewModel;
