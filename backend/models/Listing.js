// ── Listing Model ───────────────────────────────────────────────────────────
// Owns the in-memory listings store and exposes data-access methods.
// When MongoDB is connected,we will replace the array operations with Mongoose:
//   getAll  → Listing.find({})
//   create  → new Listing(data).save()

const { initialListings } = require('../data/mockData');

// In-memory store — seeded from mockData. Resets on every server restart.
// A real DB would persist across restarts.
let listings = [...initialListings];

const ListingModel = {
  // Return all listings
  getAll() {
    return listings;
  },

  // Create a new listing and prepend it so the newest appears first
  create(data) {
    const newId = listings.length > 0 ? Math.max(...listings.map(l => l.id)) + 1 : 1;
    const newListing = { ...data, id: newId };
    listings = [newListing, ...listings];
    return newListing;
  },

  // Delete a listing by id. Returns true if found and removed, false otherwise.
  // When MongoDB is connected, replace with: Listing.findByIdAndDelete(id)
  remove(id) {
    const before = listings.length;
    listings = listings.filter(l => l.id !== id);
    return listings.length < before;
  },
};

module.exports = ListingModel;
