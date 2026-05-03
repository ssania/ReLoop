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
const requireAuth = require('../middleware/authMiddeware');

router.get('/', getListings);

router.post('/', requireAuth, uploadListingImage.array('images', 5), createListing);

router.patch('/:id',         requireAuth, updateListing);
router.patch('/:id/nominate', requireAuth, nominateBuyer);
router.patch('/:id/confirm',  requireAuth, confirmPurchase);
router.patch('/:id/reject',   requireAuth, rejectPurchase);
router.delete('/:id',         requireAuth, deleteListing);

module.exports = router;