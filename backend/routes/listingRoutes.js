// ── Listing routes ──────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { getListings, createListing, updateListing, deleteListing } = require('../controllers/listingController');
=======
>>>>>>> 757bca5 (add buyer-seller communication via email integration)

const {
  getListings,
  getListing,   // ✅ added
  createListing,
  deleteListing
} = require('../controllers/listingController');

// GET all listings
router.get('/', getListings);

// ✅ GET single listing (IMPORTANT for detail view + email feature)
router.get('/:id', getListing);

// POST create listing
router.post('/', createListing);
<<<<<<< HEAD
router.patch('/:id', updateListing);
=======

// DELETE listing
>>>>>>> 757bca5 (add buyer-seller communication via email integration)
router.delete('/:id', deleteListing);

module.exports = router;
