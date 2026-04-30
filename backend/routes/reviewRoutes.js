// ── Review routes ───────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const { getReviews, getGivenReviews, createReview, updateReview, deleteReview } = require('../controllers/reviewController');

// /given must be declared before /:id so Express doesn't treat "given" as an id param
router.get('/given',  getGivenReviews);
router.get('/',       getReviews);
router.post('/',      createReview);
router.patch('/:id',  updateReview);
router.delete('/:id', deleteReview);

module.exports = router;
