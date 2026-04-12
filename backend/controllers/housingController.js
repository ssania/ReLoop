// ── Housing Controller ──────────────────────────────────────────────────────
// Handles request/response logic for housing resources.
// Delegates data access to the Housing model.

const HousingModel = require('../models/Housing');

// GET /api/housing
// Returns the full housing neighbourhood array as JSON.
const getHousing = (req, res) => {
  const housing = HousingModel.getAll();
  res.json(housing);
};

module.exports = { getHousing };
