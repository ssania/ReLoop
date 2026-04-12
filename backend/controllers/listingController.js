// ── Listing Controller ──────────────────────────────────────────────────────
// Handles request/response logic for listing resources.
// Delegates data access to the Listing model.

const ListingModel = require('../models/Listing');

// GET /api/listings
// Returns the full listings array as JSON.
const getListings = (_req, res) => {
  const listings = ListingModel.getAll();
  res.json(listings);
};

// POST /api/listings
// Accepts a listing object from CreateListingModal, assigns a numeric id,
// prepends it to the store, and returns the created listing with 201 Created.
const createListing = (req, res) => {
  const newListing = ListingModel.create(req.body);
  res.status(201).json(newListing);
};

// DELETE /api/listings/:id
// Removes the listing with the given numeric id from the store.
// Returns 204 No Content on success, 404 if the id is not found.
const deleteListing = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const deleted = ListingModel.remove(id);
  if (!deleted) return res.status(404).json({ message: 'Listing not found' });
  res.status(204).send();
};

module.exports = { getListings, createListing, deleteListing };
