// ── Housing routes ──────────────────────────────────────────────────────────
// GET    /api/housing                       → housingController.getHousing
// GET    /api/housing/:areaId/reviews       → housingReviewController.getHousingReviews
// POST   /api/housing/:areaId/reviews       → housingReviewController.createHousingReview

const express = require('express');
const router = express.Router();
const { getHousing } = require('../controllers/housingController');
const { getHousingReviews, createHousingReview } = require('../controllers/housingReviewController');

router.get('/', getHousing);

router.get('/:areaId/reviews', getHousingReviews);
router.post('/:areaId/reviews', createHousingReview);

module.exports = router;
