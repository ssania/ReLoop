// ── Housing routes ─────────────────────────────────────────────────────────────
// GET /api/housing   → return all housing neighbourhood data
//
// NOTE: data comes from the mock array for now.
// When MongoDB is connected, replace with: Housing.find({})

const express = require('express');
const router = express.Router();
const { housing } = require('../data/mockData');

// GET /api/housing
// Returns the full housing array as JSON.
router.get('/', (req, res) => {
  res.json(housing);
});

module.exports = router;
