const express = require('express');
const router = express.Router();

const {
  getListings,
  createListing,
  updateListing,
  deleteListing,
  nominateBuyer,
  confirmPurchase,
  rejectPurchase,
} = require('../controllers/listingController');

const { uploadListingImage } = require('../config/s3'); // ✅ important

router.get('/', getListings);

// ✅ Add middleware here
router.post('/', uploadListingImage.array('images', 5), createListing);

router.patch('/:id', updateListing);
router.patch('/:id/nominate', nominateBuyer);
router.patch('/:id/confirm', confirmPurchase);
router.patch('/:id/reject', rejectPurchase);
router.delete('/:id', deleteListing);

module.exports = router;