const test = require('node:test');
const assert = require('node:assert/strict');
const {
  clearModules,
  loadFresh,
  makeQueryChain,
  mockModule,
  mockResponse,
} = require('./helpers/controllerTestUtils');

function loadController(overrides = {}) {
  clearModules([
    'controllers/housingReviewController.js',
    'models/HousingReview.js',
    'models/Housing.js',
  ]);

  const HousingReviewMongoose = {
    aggregate: async () => [],
    find: () => makeQueryChain([]),
    findOne: async () => null,
    create: async () => null,
    findById: async () => null,
    ...overrides.HousingReviewMongoose,
  };
  const HousingMongoose = {
    findByIdAndUpdate: async () => null,
    ...overrides.HousingMongoose,
  };

  mockModule('models/HousingReview.js', { HousingReviewMongoose });
  mockModule('models/Housing.js', { HousingMongoose });

  return { controller: loadFresh('controllers/housingReviewController.js'), HousingReviewMongoose, HousingMongoose };
}

test('getHousingReviews returns normalized public review data', async () => {
  const { controller } = loadController({
    HousingReviewMongoose: {
      find: () => makeQueryChain([{
        _id: { toString: () => 'review-1' },
        reviewer: { _id: { toString: () => 'user-1' }, name: 'Avery' },
        stars: 5,
        comment: 'Quiet place',
        createdAt: '2026-01-01',
      }]),
    },
  });
  const res = mockResponse();

  await controller.getHousingReviews({ params: { areaId: 'area-1' } }, res);

  assert.deepEqual(res.body, [{
    id: 'review-1',
    reviewerId: 'user-1',
    reviewer: { name: 'Avery' },
    stars: 5,
    comment: 'Quiet place',
    createdAt: '2026-01-01',
  }]);

  const failing = loadController({
    HousingReviewMongoose: { find: () => { throw new Error('db down'); } },
  }).controller;
  const errorRes = mockResponse();
  await failing.getHousingReviews({ params: { areaId: 'area-1' } }, errorRes);
  assert.equal(errorRes.statusCode, 500);
  assert.deepEqual(errorRes.body, { message: 'Failed to fetch reviews' });
});

test('createHousingReview validates stars and rejects duplicate reviews', async () => {
  const invalid = loadController().controller;
  const invalidRes = mockResponse();
  await invalid.createHousingReview({ body: { stars: 6 }, params: { areaId: 'area-1' }, user: { id: 'user-1' } }, invalidRes);
  assert.equal(invalidRes.statusCode, 400);

  const duplicate = loadController({
    HousingReviewMongoose: { findOne: async () => ({ _id: 'existing' }) },
  }).controller;
  const duplicateRes = mockResponse();
  await duplicate.createHousingReview({ body: { stars: 4 }, params: { areaId: 'area-1' }, user: { id: 'user-1' } }, duplicateRes);
  assert.equal(duplicateRes.statusCode, 409);
});

test('createHousingReview stores review and updates housing aggregate stats', async () => {
  let updatedArea;
  const doc = {
    _id: { toString: () => 'review-1' },
    area: 'area-1',
    stars: 4,
    comment: 'Good location',
    createdAt: '2026-01-01',
    populate: async () => ({ reviewer: { name: 'Avery' } }),
  };
  const { controller } = loadController({
    HousingReviewMongoose: {
      findOne: async () => null,
      create: async () => doc,
      aggregate: async () => [{ avg: 4.25, count: 2 }],
    },
    HousingMongoose: { findByIdAndUpdate: async (...args) => { updatedArea = args; } },
  });
  const res = mockResponse();

  await controller.createHousingReview({
    body: { stars: '4', comment: 'Good location' },
    params: { areaId: 'area-1' },
    user: { id: 'user-1' },
  }, res);

  assert.equal(res.statusCode, 201);
  assert.deepEqual(updatedArea, ['area-1', { averageRating: 4.3, reviewCount: 2 }]);
  assert.equal(res.body.review.reviewer.name, 'Avery');
  assert.equal(res.body.averageRating, 4.3);

  const failing = loadController({
    HousingReviewMongoose: {
      findOne: async () => null,
      create: async () => { throw new Error('db down'); },
    },
  }).controller;
  const errorRes = mockResponse();
  await failing.createHousingReview({
    body: { stars: 4 },
    params: { areaId: 'area-1' },
    user: { id: 'user-1' },
  }, errorRes);
  assert.equal(errorRes.statusCode, 500);
  assert.deepEqual(errorRes.body, { message: 'Failed to create review' });
});

test('updateHousingReview enforces ownership and updates owned reviews', async () => {
  const missing = loadController({
    HousingReviewMongoose: { findById: async () => null },
  }).controller;
  const missingRes = mockResponse();
  await missing.updateHousingReview({ params: { reviewId: 'review-1' }, body: {}, user: { id: 'user-1' } }, missingRes);
  assert.equal(missingRes.statusCode, 404);

  const forbidden = loadController({
    HousingReviewMongoose: { findById: async () => ({ reviewer: { toString: () => 'other-user' } }) },
  }).controller;
  const forbiddenRes = mockResponse();
  await forbidden.updateHousingReview({ params: { reviewId: 'review-1' }, body: {}, user: { id: 'user-1' } }, forbiddenRes);
  assert.equal(forbiddenRes.statusCode, 403);

  const review = {
    _id: { toString: () => 'review-1' },
    area: 'area-1',
    reviewer: { toString: () => 'user-1' },
    stars: 2,
    comment: '',
    createdAt: '2026-01-01',
    save: async () => {},
  };
  const success = loadController({
    HousingReviewMongoose: {
      findById: async () => review,
      aggregate: async () => [{ avg: 5, count: 1 }],
    },
  }).controller;
  const successRes = mockResponse();

  await success.updateHousingReview({
    params: { reviewId: 'review-1' },
    body: { stars: 5, comment: 'Updated' },
    user: { id: 'user-1', name: 'Avery' },
  }, successRes);

  assert.equal(review.stars, 5);
  assert.equal(review.comment, 'Updated');
  assert.equal(successRes.body.averageRating, 5);

  const invalidStars = loadController().controller;
  const invalidRes = mockResponse();
  await invalidStars.updateHousingReview({ params: { reviewId: 'review-1' }, body: { stars: 0 }, user: { id: 'user-1' } }, invalidRes);
  assert.equal(invalidRes.statusCode, 400);

  const failing = loadController({
    HousingReviewMongoose: { findById: async () => { throw new Error('db down'); } },
  }).controller;
  const errorRes = mockResponse();
  await failing.updateHousingReview({ params: { reviewId: 'review-1' }, body: {}, user: { id: 'user-1' } }, errorRes);
  assert.equal(errorRes.statusCode, 500);
});

test('deleteHousingReview enforces ownership and returns updated aggregates', async () => {
  const missing = loadController({
    HousingReviewMongoose: { findById: async () => null },
  }).controller;
  const missingRes = mockResponse();
  await missing.deleteHousingReview({ params: { reviewId: 'review-1' }, user: { id: 'user-1' } }, missingRes);
  assert.equal(missingRes.statusCode, 404);

  const forbidden = loadController({
    HousingReviewMongoose: { findById: async () => ({ reviewer: { toString: () => 'other-user' } }) },
  }).controller;
  const forbiddenRes = mockResponse();
  await forbidden.deleteHousingReview({ params: { reviewId: 'review-1' }, user: { id: 'user-1' } }, forbiddenRes);
  assert.equal(forbiddenRes.statusCode, 403);

  let deleted = false;
  const success = loadController({
    HousingReviewMongoose: {
      findById: async () => ({
        area: 'area-1',
        reviewer: { toString: () => 'user-1' },
        deleteOne: async () => { deleted = true; },
      }),
      aggregate: async () => [],
    },
  }).controller;
  const successRes = mockResponse();

  await success.deleteHousingReview({ params: { reviewId: 'review-1' }, user: { id: 'user-1' } }, successRes);

  assert.equal(deleted, true);
  assert.deepEqual(successRes.body, { averageRating: 0, reviewCount: 0 });

  const failing = loadController({
    HousingReviewMongoose: { findById: async () => { throw new Error('db down'); } },
  }).controller;
  const errorRes = mockResponse();
  await failing.deleteHousingReview({ params: { reviewId: 'review-1' }, user: { id: 'user-1' } }, errorRes);
  assert.equal(errorRes.statusCode, 500);
});
