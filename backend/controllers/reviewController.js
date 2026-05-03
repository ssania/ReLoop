// ── Review Controller ───────────────────────────────────────────────────────

const ReviewMongoose = require('../models/Review');
const User = require('../models/User');
const { ListingMongoose } = require('../models/Listing');
const mongoose = require('mongoose');

// Recomputes avgRating and totalReviews on the seller after any review change.
async function recalcSellerRating(targetUserId) {
  const result = await ReviewMongoose.aggregate([
    { $match: { targetUser: targetUserId } },
    { $group: { _id: null, avg: { $avg: '$stars' }, count: { $sum: 1 } } },
  ]);
  const avg   = result.length ? parseFloat(result[0].avg.toFixed(2)) : 0;
  const count = result.length ? result[0].count : 0;
  await User.findByIdAndUpdate(targetUserId, { avgRating: avg, totalReviews: count });
}

// GET /api/reviews/given
// Returns all reviews submitted by the logged-in user as a buyer (includes listingRef for keying).
const getGivenReviews = async (req, res) => {
  try {
    const reviews = await ReviewMongoose
      .find({ reviewer: new mongoose.Types.ObjectId(req.user.id) })
      .lean();

    // Serialize ObjectId fields to strings so frontend Map keying works correctly
    const serialized = reviews.map(r => ({
      ...r,
      _id:        r._id.toString(),
      listingRef: r.listingRef.toString(),
      reviewer:   r.reviewer.toString(),
      targetUser: r.targetUser.toString(),
    }));

    res.json(serialized);
  } catch (err) {
    console.error('Failed to fetch given reviews:', err);
    res.status(500).json({ message: 'Failed to fetch given reviews' });
  }
};

// GET /api/reviews?sellerId=<id>
// Returns all reviews received by the given seller, populated with reviewer name.
const getReviews = async (req, res) => {
  try {
    const { sellerId } = req.query;
    if (!sellerId) return res.status(400).json({ message: 'sellerId query param is required' });

    const reviews = await ReviewMongoose
      .find({ targetUser: sellerId })
      .populate('reviewer', 'name')
      .sort({ createdAt: -1 })
      .lean();

    res.json(reviews);
  } catch (err) {
    console.error('Failed to fetch reviews:', err);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

// POST /api/reviews
// Body: { listingId, stars, comment }
const createReview = async (req, res) => {
  try {
    const { listingId, stars, comment } = req.body;
    if (!listingId || !stars) return res.status(400).json({ message: 'listingId and stars are required' });

    const listing = await ListingMongoose.findById(listingId).lean();
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.status !== 'Sold') return res.status(400).json({ message: 'Can only review a sold listing' });

    if (listing.buyer?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the confirmed buyer can review this listing' });
    }

    const review = await ReviewMongoose.create({
      reviewer:   req.user.id,
      targetUser: listing.owner,
      listingRef: listing._id,
      stars,
      comment: comment || '',
    });

    await recalcSellerRating(listing.owner);

    const populated = await ReviewMongoose
      .findById(review._id)
      .populate('reviewer', 'name')
      .lean();

    res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'You have already reviewed this listing' });
    console.error('Failed to create review:', err);
    res.status(500).json({ message: 'Failed to create review' });
  }
};

// PATCH /api/reviews/:id
// Body: { stars, comment }
const updateReview = async (req, res) => {
  try {
    const { stars, comment } = req.body;
    const review = await ReviewMongoose.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (stars !== undefined) review.stars = stars;
    if (comment !== undefined) review.comment = comment;
    await review.save();

    await recalcSellerRating(review.targetUser);

    const populated = await ReviewMongoose
      .findById(review._id)
      .populate('reviewer', 'name')
      .lean();

    res.json(populated);
  } catch (err) {
    console.error('Failed to update review:', err);
    res.status(500).json({ message: 'Failed to update review' });
  }
};

// DELETE /api/reviews/:id
const deleteReview = async (req, res) => {
  try {
    const review = await ReviewMongoose.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const targetUserId = review.targetUser;
    await review.deleteOne();
    await recalcSellerRating(targetUserId);

    res.status(204).send();
  } catch (err) {
    console.error('Failed to delete review:', err);
    res.status(500).json({ message: 'Failed to delete review' });
  }
};

// GET /api/reviews/seller-stats/:id
// Returns live avgRating and totalReviews for a seller directly from the User doc.
const getSellerStats = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('avgRating totalReviews').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ avgRating: user.avgRating, totalReviews: user.totalReviews });
  } catch (err) {
    console.error('Failed to fetch seller stats:', err);
    res.status(500).json({ message: 'Failed to fetch seller stats' });
  }
};

module.exports = { getReviews, getGivenReviews, getSellerStats, createReview, updateReview, deleteReview };
