// ── Save Model ────────────────────────────────────────────────────────────────
// Tracks which listing IDs a user has heart-saved.
// Mock implementation: single in-memory Set keyed by a placeholder userId.
// MongoDB version: User.favorites array (see User.js schema).

let savedIds = new Set();

const SaveModel = {
  // MongoDB: return (await User.findById(userId)).favorites;
  getAll() {
    return [...savedIds];
  },

  // MongoDB: User.findByIdAndUpdate(userId, { $addToSet: { favorites: listingId } });
  add(listingId) {
    savedIds.add(listingId);
    return [...savedIds];
  },

  // MongoDB: User.findByIdAndUpdate(userId, { $pull: { favorites: listingId } });
  remove(listingId) {
    const existed = savedIds.has(listingId);
    savedIds.delete(listingId);
    return existed;
  },
};

module.exports = SaveModel;
