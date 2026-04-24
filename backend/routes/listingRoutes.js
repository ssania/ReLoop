// ── Listing routes ──────────────────────────────────────────────────────────
// GET  /api/listings  → listingController.getListings
// POST /api/listings  → listingController.createListing

const express = require('express');
const router = express.Router();
const { getListings, createListing, updateListing, deleteListing } = require('../controllers/listingController');

router.get('/', getListings);
router.post('/', createListing);
router.patch('/:id', updateListing);
router.delete('/:id', deleteListing);

module.exports = router;
