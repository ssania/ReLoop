const User = require('../models/User');

// Placeholder until auth is implemented — resolves to the "John Doe" seed user.
async function getCurrentUserId() {
  const user = await User.findOne({ email: 'john.doe@reloop.com' });
  if (!user) throw new Error('Current user not found — run seed.js first');
  return user._id;
}

// GET /api/favorites
const getFavorites = async (_req, res) => {
  try {
    const userId = await getCurrentUserId();
    const user = await User.findById(userId).select('favorites').lean();
    res.json(user.favorites.map(id => id.toString()));
  } catch (err) {
    console.error('Failed to fetch favorites:', err);
    res.status(500).json({ message: 'Failed to fetch favorites' });
  }
};

// POST /api/favorites/:id
const addFavorite = async (req, res) => {
  try {
    const userId = await getCurrentUserId();
    await User.findByIdAndUpdate(userId, { $addToSet: { favorites: req.params.id } });
    res.status(201).json({ message: 'Added to favorites' });
  } catch (err) {
    console.error('Failed to add favorite:', err);
    res.status(500).json({ message: 'Failed to add favorite' });
  }
};

// DELETE /api/favorites/:id
const removeFavorite = async (req, res) => {
  try {
    const userId = await getCurrentUserId();
    const user = await User.findById(userId).select('favorites').lean();
    const existed = user.favorites.some(id => id.toString() === req.params.id);
    if (!existed) return res.status(404).json({ message: 'Favorite not found' });
    await User.findByIdAndUpdate(userId, { $pull: { favorites: req.params.id } });
    res.status(204).send();
  } catch (err) {
    console.error('Failed to remove favorite:', err);
    res.status(500).json({ message: 'Failed to remove favorite' });
  }
};

module.exports = { getFavorites, addFavorite, removeFavorite };
