// ── Housing Controller ──────────────────────────────────────────────────────
// Handles request/response logic for housing resources.
// Delegates data access to the Housing model.

const HousingModel = require('../models/Housing');

// GET /api/housing
// Returns all housing areas with their reviews as JSON.
const getHousing = async (req, res) => {
  try {
    const housing = await HousingModel.getAll();
    res.json(housing);
  } catch (err) {
    console.error('Failed to fetch housing:', err);
    res.status(500).json({ message: 'Failed to fetch housing' });
  }
};

module.exports = { getHousing };
