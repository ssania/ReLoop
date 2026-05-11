// ── HousingReview Controller ─────────────────────────────────────────────────
const { HousingReviewMongoose } = require('../models/HousingReview');
const { HousingMongoose } = require('../models/Housing');

async function recomputeAndSave(areaId) {
  const stats = await HousingReviewMongoose.aggregate([
    { $match: { area: areaId } },
    { $group: { _id: '$area', avg: { $avg: '$stars' }, count: { $sum: 1 } } },
  ]);
  const averageRating = stats.length ? +stats[0].avg.toFixed(1) : 0;
  const reviewCount   = stats.length ? stats[0].count : 0;
  await HousingMongoose.findByIdAndUpdate(areaId, { averageRating, reviewCount });
  return { averageRating, reviewCount };
}

// GET /api/housing/:areaId/reviews  (public)
const getHousingReviews = async (req, res) => {
  try {
    const reviews = await HousingReviewMongoose.find({ area: req.params.areaId })
      .populate('reviewer', 'name')
      .sort({ createdAt: -1 })
      .lean();
    res.json(reviews.map(r => ({
      id:         r._id.toString(),
      reviewerId: r.reviewer?._id?.toString(),
      reviewer:   { name: r.reviewer?.name ?? 'Anonymous' },
      stars:      r.stars,
      comment:    r.comment,
      createdAt:  r.createdAt,
    })));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

// POST /api/housing/:areaId/reviews  (auth required)
const createHousingReview = async (req, res) => {
  const { stars, comment } = req.body || {};
  const starsNum = Number(stars);
  if (!Number.isFinite(starsNum) || starsNum < 1 || starsNum > 5) {
    return res.status(400).json({ message: 'stars must be a number between 1 and 5' });
  }

  try {
    const existing = await HousingReviewMongoose.findOne({ area: req.params.areaId, reviewer: req.user.id });
    if (existing) return res.status(409).json({ message: 'You have already reviewed this area' });

    const doc = await HousingReviewMongoose.create({
      reviewer: req.user.id,
      area:     req.params.areaId,
      stars:    starsNum,
      comment:  comment || '',
    });
    const populated = await doc.populate('reviewer', 'name');
    const { averageRating, reviewCount } = await recomputeAndSave(doc.area);

    res.status(201).json({
      review: {
        id:         doc._id.toString(),
        reviewerId: req.user.id,
        reviewer:   { name: populated.reviewer?.name ?? 'Anonymous' },
        stars:      doc.stars,
        comment:    doc.comment,
        createdAt:  doc.createdAt,
      },
      averageRating,
      reviewCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create review' });
  }
};

// PATCH /api/housing/:areaId/reviews/:reviewId  (auth required, own review only)
const updateHousingReview = async (req, res) => {
  const { stars, comment } = req.body || {};
  const starsNum = stars !== undefined ? Number(stars) : undefined;
  if (starsNum !== undefined && (!Number.isFinite(starsNum) || starsNum < 1 || starsNum > 5)) {
    return res.status(400).json({ message: 'stars must be a number between 1 and 5' });
  }

  try {
    const review = await HousingReviewMongoose.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.reviewer.toString() !== req.user.id) return res.status(403).json({ message: 'You can only edit your own reviews' });

    if (starsNum !== undefined) review.stars = starsNum;
    if (comment !== undefined)  review.comment = comment;
    await review.save();

    const { averageRating, reviewCount } = await recomputeAndSave(review.area);

    res.json({
      review: {
        id:         review._id.toString(),
        reviewerId: req.user.id,
        reviewer:   { name: req.user.name },
        stars:      review.stars,
        comment:    review.comment,
        createdAt:  review.createdAt,
      },
      averageRating,
      reviewCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update review' });
  }
};

// DELETE /api/housing/:areaId/reviews/:reviewId  (auth required, own review only)
const deleteHousingReview = async (req, res) => {
  try {
    const review = await HousingReviewMongoose.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.reviewer.toString() !== req.user.id) return res.status(403).json({ message: 'You can only delete your own reviews' });

    const areaId = review.area;
    await review.deleteOne();
    const { averageRating, reviewCount } = await recomputeAndSave(areaId);

    res.json({ averageRating, reviewCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete review' });
  }
};

module.exports = { getHousingReviews, createHousingReview, updateHousingReview, deleteHousingReview };
