// ── Review Controller ───────────────────────────────────────────────────────

const ReviewMongoose = require('../models/Review');
const User = require('../models/User');
const { ListingMongoose } = require('../models/Listing');

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
// Returns all reviews submitted by John Doe as a buyer (includes listingRef for keying).
const getGivenReviews = async (req, res) => {
  try {
    const User_ = require('../models/User');
    const reviewer = await User_.findOne({ email: 'john.doe@reloop.com' });
    if (!reviewer) return res.json([]);

    const reviews = await ReviewMongoose
      .find({ reviewer: reviewer._id })
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
// Hardcoded reviewer = John Doe until auth is implemented.
const createReview = async (req, res) => {
  try {
    const { listingId, stars, comment } = req.body;
    if (!listingId || !stars) return res.status(400).json({ message: 'listingId and stars are required' });

    const listing = await ListingMongoose.findById(listingId).lean();
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.status !== 'Sold') return res.status(400).json({ message: 'Can only review a sold listing' });

    // Hardcoded to John Doe until JWT auth is wired up
    const User_ = require('../models/User');
    const reviewer = await User_.findOne({ email: 'john.doe@reloop.com' });
    if (!reviewer) return res.status(500).json({ message: 'Default user not found — run seed.js' });

    if (listing.buyer?.toString() !== reviewer._id.toString()) {
      return res.status(403).json({ message: 'Only the confirmed buyer can review this listing' });
    }

    const review = await ReviewMongoose.create({
      reviewer:   reviewer._id,
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

module.exports = { getReviews, getGivenReviews, createReview, updateReview, deleteReview };
