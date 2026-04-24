<<<<<<< HEAD
// ── Listing Controller ──────────────────────────────────────────────────────
const ListingModel = require('../models/Listing');
const User = require('../models/User');

// Placeholder until auth is implemented — resolves to the "John Doe" seed user.
async function getDefaultOwner() {
  const user = await User.findOne({ email: 'john.doe@reloop.com' });
  if (!user) throw new Error('Default owner not found — run seed.js first');
  return user._id;
}
=======
const Listing = require('../models/Listing');
const { initialListings } = require('../data/mockData');
>>>>>>> 757bca5 (add buyer-seller communication via email integration)

// GET /api/listings
const getListings = async (_req, res) => {
  try {
<<<<<<< HEAD
    const listings = await ListingModel.getAll();
    res.json(listings);
  } catch (err) {
    console.error('Failed to fetch listings:', err);
    res.status(500).json({ message: 'Failed to fetch listings' });
=======
    const listings = await Listing.find({ status: { $ne: 'Sold' } })
      .populate('owner', 'name email avgRating')
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (err) {
    console.log('MongoDB not connected, using mock data');
    res.json(initialListings);
  }
};

// GET /api/listings/:id
const getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('owner', 'name email avgRating');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json(listing);
  } catch (err) {
    // fallback to mock data
    const listing = initialListings.find(
      l => l.id === parseInt(req.params.id)
    );

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json(listing);
>>>>>>> 757bca5 (add buyer-seller communication via email integration)
  }
};

// POST /api/listings
const createListing = async (req, res) => {
  try {
<<<<<<< HEAD
    const ownerId = await getDefaultOwner();
    const { owner, ...rest } = req.body; // strip the frontend's plain-object owner
    const newListing = await ListingModel.create({ ...rest, owner: ownerId });
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
=======
    const listing = await Listing.create(req.body);
    res.status(201).json(listing);
  } catch (err) {
    res.status(400).json({ error: err.message });
>>>>>>> 757bca5 (add buyer-seller communication via email integration)
  }
};

// DELETE /api/listings/:id
const deleteListing = async (req, res) => {
  try {
<<<<<<< HEAD
    const deleted = await ListingModel.remove(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Listing not found' });
    res.status(204).send();
  } catch (err) {
    console.error('Failed to delete listing:', err);
    res.status(500).json({ message: 'Failed to delete listing' });
  }
};

module.exports = { getListings, createListing, updateListing, deleteListing };
=======
    const listing = await Listing.findByIdAndDelete(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  getListings,
  getListing,
  createListing,
  deleteListing
};
>>>>>>> 757bca5 (add buyer-seller communication via email integration)
