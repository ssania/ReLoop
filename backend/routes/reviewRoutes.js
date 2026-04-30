// ── Review routes ───────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const { getReviews, getGivenReviews, getSellerStats, createReview, updateReview, deleteReview } = require('../controllers/reviewController');
const requireAuth = require('../middleware/authMiddeware');

// named routes must be declared before /:id so Express doesn't treat them as id params
router.get('/given',              requireAuth, getGivenReviews);
router.get('/seller-stats/:id',   getSellerStats);
router.get('/',                   getReviews);
router.post('/',      requireAuth, createReview);
router.patch('/:id',  requireAuth, updateReview);
router.delete('/:id', requireAuth, deleteReview);

module.exports = router;
