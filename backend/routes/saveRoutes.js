// ── Save routes ───────────────────────────────────────────────────────────────
// GET    /api/saves       → getSaves
// POST   /api/saves/:id  → addSave
// DELETE /api/saves/:id  → removeSave

const express = require('express');
const router = express.Router();
const { getSaves, addSave, removeSave } = require('../controllers/saveController');

router.get('/', getSaves);
router.post('/:id', addSave);
router.delete('/:id', removeSave);

module.exports = router;
