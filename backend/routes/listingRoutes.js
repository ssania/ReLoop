const express = require('express');
const router = express.Router();

const {
  getListings,
  createListing,
  updateListing,
  deleteListing
} = require('../controllers/listingController');

const { uploadListingImage } = require('../config/s3'); // ✅ important

router.get('/', getListings);

// ✅ Add middleware here
router.post('/', uploadListingImage.array('images', 5), createListing);

router.patch('/:id', updateListing);
router.delete('/:id', deleteListing);

module.exports = router;