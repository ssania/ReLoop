// ── Save Controller ───────────────────────────────────────────────────────────
const SaveModel = require('../models/Save');

// GET /api/saves — return all saved listing IDs
const getSaves = (_req, res) => {
  res.json(SaveModel.getAll());
};

// POST /api/saves/:id — add a listing to saves
const addSave = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const ids = SaveModel.add(id);
  res.status(201).json(ids);
};

// DELETE /api/saves/:id — remove a listing from saves
const removeSave = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const existed = SaveModel.remove(id);
  if (!existed) return res.status(404).json({ message: 'Save not found' });
  res.status(204).send();
};

module.exports = { getSaves, addSave, removeSave };
