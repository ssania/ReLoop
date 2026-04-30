// ── Listing Controller ──────────────────────────────────────────────────────
const ListingModel = require('../models/Listing');
const { ListingMongoose } = ListingModel;
const User = require('../models/User');
const { sendBuyerNomination, sendSellerConfirmation } = require('../config/mailer');
const { s3 } = require('../config/s3');
const { DeleteObjectsCommand } = require('@aws-sdk/client-s3');

// GET /api/listings
const getListings = async (_req, res) => {
  try {
    const listings = await ListingModel.getAll();
    res.json(listings);
  } catch (err) {
    console.error('Failed to fetch listings:', err);
    res.status(500).json({ message: 'Failed to fetch listings' });
  }
};

// POST /api/listings
const createListing = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { owner, ...rest } = req.body;

    // ✅ Get S3 uploaded images
    const imageUrls = req.files ? req.files.map(file => ({
      url: file.location,
      key: file.key
    })) : [];

    const newListing = await ListingModel.create({
      ...rest,
      owner: ownerId,
      imageUrls
    });

    res.status(201).json(newListing);
  } catch (err) {
    console.error('Failed to create listing:', err);
    res.status(500).json({ message: 'Failed to create listing' });
  }
};

// PATCH /api/listings/:id
const updateListing = async (req, res) => {
  try {
    const updated = await ListingModel.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Listing not found' });
    res.json(updated);
  } catch (err) {
    console.error('Failed to update listing:', err);
    res.status(500).json({ message: 'Failed to update listing' });
  }
};

// DELETE /api/listings/:id
// Also deletes all associated images from S3 using the stored keys
const deleteListing = async (req, res) => {
  try {
    const listing = await ListingMongoose.findById(req.params.id).lean();
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    if (listing.imageUrls?.length > 0) {
      await s3.send(new DeleteObjectsCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Delete: {
          Objects: listing.imageUrls.map(img => ({ Key: img.key })),
        },
      }));
    }

    await ListingMongoose.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error('Failed to delete listing:', err);
    res.status(500).json({ message: 'Failed to delete listing' });
  }
};

// PATCH /api/listings/:id/nominate
// Seller picks a buyer by email → status becomes pending-confirmation, email sent to buyer
const nominateBuyer = async (req, res) => {
  try {
    const { buyerEmail } = req.body;
    if (!buyerEmail) return res.status(400).json({ message: 'buyerEmail is required' });

    const buyer = await User.findOne({ email: buyerEmail });
    if (!buyer) return res.status(404).json({ message: 'No ReLoop user found with that email' });

    const listing = await ListingMongoose.findById(req.params.id).populate('owner', 'name email');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    listing.buyer = buyer._id;
    listing.status = 'pending-confirmation';
    await listing.save();

    await sendBuyerNomination({
      buyerEmail:    buyer.email,
      buyerName:     buyer.name,
      sellerName:    listing.owner.name,
      listingTitle:  listing.title,
      listingPrice:  listing.price,
    });

    res.json({ message: 'Buyer nominated', listingId: listing._id });
  } catch (err) {
    console.error('Failed to nominate buyer:', err);
    res.status(500).json({ message: 'Failed to nominate buyer' });
  }
};

// PATCH /api/listings/:id/confirm
// Buyer confirms → status becomes Sold, listing pushed into buyer.bought[]
const confirmPurchase = async (req, res) => {
  try {
    const listing = await ListingMongoose.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('buyer', 'name email');

    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.status !== 'pending-confirmation') return res.status(400).json({ message: 'Listing is not pending confirmation' });

    listing.status = 'Sold';
    await listing.save();

    await User.findByIdAndUpdate(listing.buyer._id, { $addToSet: { bought: listing._id } });

    await sendSellerConfirmation({
      sellerEmail:  listing.owner.email,
      sellerName:   listing.owner.name,
      buyerName:    listing.buyer.name,
      listingTitle: listing.title,
      confirmed:    true,
    });

    res.json({ message: 'Purchase confirmed', listingId: listing._id });
  } catch (err) {
    console.error('Failed to confirm purchase:', err);
    res.status(500).json({ message: 'Failed to confirm purchase' });
  }
};

// PATCH /api/listings/:id/reject
// Buyer rejects → status reverts to Available, buyer cleared, seller notified
const rejectPurchase = async (req, res) => {
  try {
    const listing = await ListingMongoose.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('buyer', 'name email');

    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.status !== 'pending-confirmation') return res.status(400).json({ message: 'Listing is not pending confirmation' });

    const buyerName = listing.buyer.name;
    listing.status = 'Available';
    listing.buyer  = null;
    await listing.save();

    await sendSellerConfirmation({
      sellerEmail:  listing.owner.email,
      sellerName:   listing.owner.name,
      buyerName,
      listingTitle: listing.title,
      confirmed:    false,
    });

    res.json({ message: 'Purchase rejected', listingId: listing._id });
  } catch (err) {
    console.error('Failed to reject purchase:', err);
    res.status(500).json({ message: 'Failed to reject purchase' });
  }
};

module.exports = { getListings, createListing, updateListing, deleteListing, nominateBuyer, confirmPurchase, rejectPurchase };
