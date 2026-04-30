// ── Listing Controller ──────────────────────────────────────────────────────
const ListingModel = require('../models/Listing');
const { ListingMongoose } = ListingModel;
const User = require('../models/User');
const { s3 } = require('../config/s3');
const { DeleteObjectsCommand } = require('@aws-sdk/client-s3');

// Placeholder until auth is implemented — resolves to the "John Doe" seed user.
async function getDefaultOwner() {
  const user = await User.findOne({ email: 'john.doe@reloop.com' });
  if (!user) throw new Error('Default owner not found — run seed.js first');
  return user._id;
}

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
    const ownerId = await getDefaultOwner();
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

module.exports = { getListings, createListing, updateListing, deleteListing };
