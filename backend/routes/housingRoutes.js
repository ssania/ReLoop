// ── Housing routes ──────────────────────────────────────────────────────────
// GET /api/housing  → housingController.getHousing

const express = require('express');
const router = express.Router();
const { getHousing } = require('../controllers/housingController');

router.get('/', getHousing);

module.exports = router;
