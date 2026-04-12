// ── Housing Model ───────────────────────────────────────────────────────────
// Owns the housing neighbourhood data.
// When MongoDB is connected we will replace with: Housing.find({})

const { housing } = require('../data/mockData');

const HousingModel = {
  // Return all housing neighbourhood records
  getAll() {
    return housing;
  },
};

module.exports = HousingModel;
