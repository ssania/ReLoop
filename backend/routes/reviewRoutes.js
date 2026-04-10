// ── Review routes ──────────────────────────────────────────────────────────────
// GET /api/reviews   → return the current user's received reviews
//
// NOTE: hardcoded to "Alex J." (the mock logged-in user) for now.
// When auth is added, filter by req.user._id from the JWT middleware.

const express = require('express');
const router = express.Router();
const { myReviews } = require('../data/mockData');

// GET /api/reviews
router.get('/', (req, res) => {
  res.json(myReviews);
});

module.exports = router;
