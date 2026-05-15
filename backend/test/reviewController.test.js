const test = require('node:test');
const assert = require('node:assert/strict');
const {
  clearModules,
  loadFresh,
  makeQueryChain,
  mockModule,
  mockResponse,
} = require('./helpers/controllerTestUtils');

const reviewerId = '65f000000000000000000001';
const sellerId = '65f000000000000000000002';
const listingId = '65f000000000000000000003';
const reviewId = '65f000000000000000000004';

function loadController(overrides = {}) {
  clearModules([
    'controllers/reviewController.js',
    'models/Review.js',
    'models/User.js',
    'models/Listing.js',
  ]);

  const ReviewMongoose = {
    aggregate: async () => [],
    find: () => makeQueryChain([]),
    findById: () => makeQueryChain(null),
    create: async () => ({ _id: reviewId }),
    ...overrides.ReviewMongoose,
  };
  const User = {
    findById: () => makeQueryChain(null),
    findByIdAndUpdate: async () => null,
    ...overrides.User,
  };
  const ListingMongoose = {
    findById: () => makeQueryChain(null),
    ...overrides.ListingMongoose,
  };
  const ListingModel = { ListingMongoose, ...overrides.ListingModel };

  mockModule('models/Review.js', ReviewMongoose);
  mockModule('models/User.js', User);
  mockModule('models/Listing.js', ListingModel);

  return { controller: loadFresh('controllers/reviewController.js'), ReviewMongoose, User, ListingMongoose };
}

test('getGivenReviews serializes ObjectId fields for the logged-in reviewer', async () => {
  const { controller } = loadController({
    ReviewMongoose: {
      find: () => makeQueryChain([{
        _id: { toString: () => reviewId },
        listingRef: { toString: () => listingId },
        reviewer: { toString: () => reviewerId },
        targetUser: { toString: () => sellerId },
        stars: 5,
      }]),
    },
  });
  const res = mockResponse();

  await controller.getGivenReviews({ user: { id: reviewerId } }, res);

  assert.equal(res.body[0]._id, reviewId);
  assert.equal(res.body[0].listingRef, listingId);
  assert.equal(res.body[0].reviewer, reviewerId);

  const failing = loadController({
    ReviewMongoose: { find: () => { throw new Error('db down'); } },
  }).controller;
  const errorRes = mockResponse();
  await failing.getGivenReviews({ user: { id: reviewerId } }, errorRes);
  assert.equal(errorRes.statusCode, 500);
  assert.deepEqual(errorRes.body, { message: 'Failed to fetch given reviews' });
});

test('getReviews requires sellerId and returns populated reviews', async () => {
  const missing = loadController().controller;
  const missingRes = mockResponse();
  await missing.getReviews({ query: {} }, missingRes);
  assert.equal(missingRes.statusCode, 400);

  const { controller } = loadController({
    ReviewMongoose: { find: () => makeQueryChain([{ _id: reviewId, stars: 4 }]) },
  });
  const res = mockResponse();

  await controller.getReviews({ query: { sellerId } }, res);

  assert.deepEqual(res.body, [{ _id: reviewId, stars: 4 }]);

  const failing = loadController({
    ReviewMongoose: { find: () => { throw new Error('db down'); } },
  }).controller;
  const errorRes = mockResponse();
  await failing.getReviews({ query: { sellerId } }, errorRes);
  assert.equal(errorRes.statusCode, 500);
  assert.deepEqual(errorRes.body, { message: 'Failed to fetch reviews' });
});

test('createReview validates listing state, buyer ownership, duplicates, and success', async () => {
  const missingFields = loadController().controller;
  const missingRes = mockResponse();
  await missingFields.createReview({ body: {}, user: { id: reviewerId } }, missingRes);
  assert.equal(missingRes.statusCode, 400);

  const missingListing = loadController({
    ListingMongoose: { findById: () => makeQueryChain(null) },
  }).controller;
  const missingListingRes = mockResponse();
  await missingListing.createReview({ body: { listingId, stars: 5 }, user: { id: reviewerId } }, missingListingRes);
  assert.equal(missingListingRes.statusCode, 404);

  const unsold = loadController({
    ListingMongoose: { findById: () => makeQueryChain({ status: 'Available' }) },
  }).controller;
  const unsoldRes = mockResponse();
  await unsold.createReview({ body: { listingId, stars: 5 }, user: { id: reviewerId } }, unsoldRes);
  assert.equal(unsoldRes.statusCode, 400);

  const wrongBuyer = loadController({
    ListingMongoose: { findById: () => makeQueryChain({ status: 'Sold', buyer: { toString: () => 'someone-else' } }) },
  }).controller;
  const wrongBuyerRes = mockResponse();
  await wrongBuyer.createReview({ body: { listingId, stars: 5 }, user: { id: reviewerId } }, wrongBuyerRes);
  assert.equal(wrongBuyerRes.statusCode, 403);

  const duplicate = loadController({
    ListingMongoose: { findById: () => makeQueryChain({ _id: listingId, owner: sellerId, status: 'Sold', buyer: { toString: () => reviewerId } }) },
    ReviewMongoose: {
      create: async () => {
        const err = new Error('duplicate');
        err.code = 11000;
        throw err;
      },
    },
  }).controller;
  const duplicateRes = mockResponse();
  await duplicate.createReview({ body: { listingId, stars: 5 }, user: { id: reviewerId } }, duplicateRes);
  assert.equal(duplicateRes.statusCode, 409);

  let createdPayload;
  let recalculatedUser;
  const success = loadController({
    ListingMongoose: { findById: () => makeQueryChain({ _id: listingId, owner: sellerId, status: 'Sold', buyer: { toString: () => reviewerId } }) },
    ReviewMongoose: {
      create: async payload => {
        createdPayload = payload;
        return { _id: reviewId };
      },
      aggregate: async () => [{ avg: 4.666, count: 3 }],
      findById: () => makeQueryChain({ _id: reviewId, stars: 5, reviewer: { name: 'Buyer' } }),
    },
    User: { findByIdAndUpdate: async (...args) => { recalculatedUser = args; } },
  }).controller;
  const successRes = mockResponse();

  await success.createReview({ body: { listingId, stars: 5, comment: 'Great' }, user: { id: reviewerId } }, successRes);

  assert.equal(successRes.statusCode, 201);
  assert.equal(createdPayload.targetUser, sellerId);
  assert.deepEqual(recalculatedUser, [sellerId, { avgRating: 4.67, totalReviews: 3 }]);

  const failing = loadController({
    ListingMongoose: { findById: () => makeQueryChain({ _id: listingId, owner: sellerId, status: 'Sold', buyer: { toString: () => reviewerId } }) },
    ReviewMongoose: { create: async () => { throw new Error('db down'); } },
  }).controller;
  const errorRes = mockResponse();
  await failing.createReview({ body: { listingId, stars: 5 }, user: { id: reviewerId } }, errorRes);
  assert.equal(errorRes.statusCode, 500);
  assert.deepEqual(errorRes.body, { message: 'Failed to create review' });
});

test('updateReview applies changes and recalculates seller rating', async () => {
  const missing = loadController({
    ReviewMongoose: { findById: () => null },
  }).controller;
  const missingRes = mockResponse();
  await missing.updateReview({ params: { id: reviewId }, body: { stars: 3 } }, missingRes);
  assert.equal(missingRes.statusCode, 404);

  const review = { _id: reviewId, targetUser: sellerId, stars: 2, comment: '', save: async () => {} };
  let userUpdate;
  let findByIdCalls = 0;
  const { controller } = loadController({
    ReviewMongoose: {
      findById: () => {
        findByIdCalls += 1;
        return findByIdCalls === 1 ? review : makeQueryChain({ _id: reviewId, stars: 4 });
      },
      aggregate: async () => [],
    },
    User: { findByIdAndUpdate: async (...args) => { userUpdate = args; } },
  });
  const res = mockResponse();

  await controller.updateReview({ params: { id: reviewId }, body: { stars: 4, comment: 'Updated' } }, res);

  assert.equal(review.stars, 4);
  assert.equal(review.comment, 'Updated');
  assert.deepEqual(userUpdate, [sellerId, { avgRating: 0, totalReviews: 0 }]);
  assert.equal(res.statusCode, 200);

  const failing = loadController({
    ReviewMongoose: { findById: () => ({ targetUser: sellerId, save: async () => { throw new Error('db down'); } }) },
  }).controller;
  const errorRes = mockResponse();
  await failing.updateReview({ params: { id: reviewId }, body: { stars: 4 } }, errorRes);
  assert.equal(errorRes.statusCode, 500);
  assert.deepEqual(errorRes.body, { message: 'Failed to update review' });
});

test('deleteReview removes existing review and recalculates seller rating', async () => {
  const missing = loadController({
    ReviewMongoose: { findById: () => null },
  }).controller;
  const missingRes = mockResponse();
  await missing.deleteReview({ params: { id: reviewId } }, missingRes);
  assert.equal(missingRes.statusCode, 404);

  let deleted = false;
  const { controller } = loadController({
    ReviewMongoose: {
      findById: () => ({ targetUser: sellerId, deleteOne: async () => { deleted = true; } }),
      aggregate: async () => [{ avg: 3, count: 1 }],
    },
  });
  const res = mockResponse();

  await controller.deleteReview({ params: { id: reviewId } }, res);

  assert.equal(deleted, true);
  assert.equal(res.statusCode, 204);

  const failing = loadController({
    ReviewMongoose: { findById: () => ({ targetUser: sellerId, deleteOne: async () => { throw new Error('db down'); } }) },
  }).controller;
  const errorRes = mockResponse();
  await failing.deleteReview({ params: { id: reviewId } }, errorRes);
  assert.equal(errorRes.statusCode, 500);
  assert.deepEqual(errorRes.body, { message: 'Failed to delete review' });
});

test('getSellerStats returns stats or 404 when seller does not exist', async () => {
  const missing = loadController({
    User: { findById: () => makeQueryChain(null) },
  }).controller;
  const missingRes = mockResponse();
  await missing.getSellerStats({ params: { id: sellerId } }, missingRes);
  assert.equal(missingRes.statusCode, 404);

  const { controller } = loadController({
    User: { findById: () => makeQueryChain({ avgRating: 4.5, totalReviews: 8 }) },
  });
  const res = mockResponse();

  await controller.getSellerStats({ params: { id: sellerId } }, res);

  assert.deepEqual(res.body, { avgRating: 4.5, totalReviews: 8 });

  const failing = loadController({
    User: { findById: () => { throw new Error('db down'); } },
  }).controller;
  const errorRes = mockResponse();
  await failing.getSellerStats({ params: { id: sellerId } }, errorRes);
  assert.equal(errorRes.statusCode, 500);
  assert.deepEqual(errorRes.body, { message: 'Failed to fetch seller stats' });
});
