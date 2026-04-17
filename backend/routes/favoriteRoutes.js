// GET    /api/favorites      → getFavorites
// POST   /api/favorites/:id → addFavorite
// DELETE /api/favorites/:id → removeFavorite

const express = require('express');
const router = express.Router();
const { getFavorites, addFavorite, removeFavorite } = require('../controllers/favoriteController');

router.get('/', getFavorites);
router.post('/:id', addFavorite);
router.delete('/:id', removeFavorite);

module.exports = router;
