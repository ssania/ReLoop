const Listing = require('../models/Listing');
const User = require('../models/User');
const { initialListings } = require('../data/mockData');

// Placeholder until auth is implemented
async function getDefaultOwner() {
  const user = await User.findOne({ email: 'john.doe@reloop.com' });
  if (!user) throw new Error('Default owner not found — run seed.js first');
  return user._id;
}

// GET /api/listings
const getListings = async (_req, res) => {
  try {
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
    const listing = initialListings.find(
      l => l.id === parseInt(req.params.id)
    );

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json(listing);
  }
};

// POST /api/listings
const createListing = async (req, res) => {
  try {
    const ownerId = await getDefaultOwner();
    const { owner, ...rest } = req.body;

    const listing = await Listing.create({ ...rest, owner: ownerId });
    res.status(201).json(listing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/listings/:id
const deleteListing = async (req, res) => {
  try {
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