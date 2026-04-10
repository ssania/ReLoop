// ── Listing routes ─────────────────────────────────────────────────────────────
// GET  /api/listings      → return all listings
// POST /api/listings      → add a new listing (prepended to the in-memory array)
//
// NOTE: listings are stored in-memory (mockData array) for now.
// When MongoDB is connected, replace the array operations with:
//   GET  → Listing.find({})
//   POST → new Listing(req.body).save()

const express = require('express');
const router = express.Router();
const { initialListings } = require('../data/mockData');

// In-memory store — starts from the mock seed data.
// A real DB would persist across restarts; this resets on every server restart.
let listings = [...initialListings];

// GET /api/listings
// Returns the full listings array as JSON.
router.get('/', (req, res) => {
  res.json(listings);
});

// POST /api/listings
// Accepts a listing object from CreateListingModal, assigns a numeric id,
// prepends it to the array, and returns the created listing.
router.post('/', (req, res) => {
  // Generate a simple incrementing id (MongoDB will replace this with _id).
  const newId = listings.length > 0 ? Math.max(...listings.map(l => l.id)) + 1 : 1;

  const newListing = {
    ...req.body,       // spread all fields sent from the frontend form
    id: newId,         // override/assign the id server-side
  };

  // Prepend so the newest listing appears first.
  listings = [newListing, ...listings];

  // 201 Created with the full listing object so the frontend can use it immediately.
  res.status(201).json(newListing);
});

module.exports = router;
