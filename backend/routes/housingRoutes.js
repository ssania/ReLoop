// ── Housing routes ──────────────────────────────────────────────────────────
// GET    /api/housing                              → getHousing (public)
// GET    /api/housing/:areaId/reviews              → getHousingReviews (public)
// POST   /api/housing/:areaId/reviews              → createHousingReview (auth)
// PATCH  /api/housing/:areaId/reviews/:reviewId   → updateHousingReview (auth, own)
// DELETE /api/housing/:areaId/reviews/:reviewId   → deleteHousingReview (auth, own)

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddeware');
const { getHousing } = require('../controllers/housingController');
const {
  getHousingReviews,
  createHousingReview,
  updateHousingReview,
  deleteHousingReview,
} = require('../controllers/housingReviewController');

router.get('/', getHousing);

router.get('/:areaId/reviews', getHousingReviews);
router.post('/:areaId/reviews', authMiddleware, createHousingReview);
router.patch('/:areaId/reviews/:reviewId', authMiddleware, updateHousingReview);
router.delete('/:areaId/reviews/:reviewId', authMiddleware, deleteHousingReview);

module.exports = router;
