const express = require('express');
const router = express.Router();

const {
  getListings,
  getListing,
  createListing,
  deleteListing
} = require('../controllers/listingController');

// GET all listings
router.get('/', getListings);

// GET single listing (for detail view + email feature)
router.get('/:id', getListing);

// POST create listing
router.post('/', createListing);

// DELETE listing
router.delete('/:id', deleteListing);

module.exports = router;