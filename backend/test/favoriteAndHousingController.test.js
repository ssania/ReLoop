const test = require('node:test');
const assert = require('node:assert/strict');
const {
  clearModules,
  loadFresh,
  makeQueryChain,
  mockModule,
  mockResponse,
} = require('./helpers/controllerTestUtils');

function loadFavorites(overrides = {}) {
  clearModules(['controllers/favoriteController.js', 'models/User.js']);
  const User = {
    findById: () => makeQueryChain({ favorites: [] }),
    findByIdAndUpdate: async () => null,
    ...overrides.User,
  };
  mockModule('models/User.js', User);
  return loadFresh('controllers/favoriteController.js');
}

function loadHousing(overrides = {}) {
  clearModules(['controllers/housingController.js', 'models/Housing.js']);
  const HousingModel = {
    getAll: async () => [],
    ...overrides.HousingModel,
  };
  mockModule('models/Housing.js', HousingModel);
  return loadFresh('controllers/housingController.js');
}

test('favorite controller lists, adds, removes, and handles missing favorites', async () => {
  const favorites = loadFavorites({
    User: {
      findById: () => makeQueryChain({ favorites: [{ toString: () => 'listing-1' }] }),
      findByIdAndUpdate: async () => null,
    },
  });
  const listRes = mockResponse();
  await favorites.getFavorites({ user: { id: 'user-1' } }, listRes);
  assert.deepEqual(listRes.body, ['listing-1']);

  const addRes = mockResponse();
  await favorites.addFavorite({ user: { id: 'user-1' }, params: { id: 'listing-2' } }, addRes);
  assert.equal(addRes.statusCode, 201);
  assert.deepEqual(addRes.body, { message: 'Added to favorites' });

  const removeRes = mockResponse();
  await favorites.removeFavorite({ user: { id: 'user-1' }, params: { id: 'listing-1' } }, removeRes);
  assert.equal(removeRes.statusCode, 204);

  const missing = loadFavorites({
    User: { findById: () => makeQueryChain({ favorites: [] }) },
  });
  const missingRes = mockResponse();
  await missing.removeFavorite({ user: { id: 'user-1' }, params: { id: 'missing' } }, missingRes);
  assert.equal(missingRes.statusCode, 404);
});

test('favorite controller returns 500 when user model operations fail', async () => {
  const favorites = loadFavorites({
    User: { findById: () => { throw new Error('db down'); } },
  });
  const res = mockResponse();

  await favorites.getFavorites({ user: { id: 'user-1' } }, res);

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { message: 'Failed to fetch favorites' });

  const addFailure = loadFavorites({
    User: { findByIdAndUpdate: async () => { throw new Error('db down'); } },
  });
  const addRes = mockResponse();
  await addFailure.addFavorite({ user: { id: 'user-1' }, params: { id: 'listing-1' } }, addRes);
  assert.equal(addRes.statusCode, 500);
  assert.deepEqual(addRes.body, { message: 'Failed to add favorite' });

  const removeFailure = loadFavorites({
    User: {
      findById: () => makeQueryChain({ favorites: [{ toString: () => 'listing-1' }] }),
      findByIdAndUpdate: async () => { throw new Error('db down'); },
    },
  });
  const removeRes = mockResponse();
  await removeFailure.removeFavorite({ user: { id: 'user-1' }, params: { id: 'listing-1' } }, removeRes);
  assert.equal(removeRes.statusCode, 500);
  assert.deepEqual(removeRes.body, { message: 'Failed to remove favorite' });
});

test('housing controller returns areas and handles failures', async () => {
  const housing = loadHousing({
    HousingModel: { getAll: async () => [{ id: 'area-1', name: 'North Village' }] },
  });
  const res = mockResponse();

  await housing.getHousing({}, res);

  assert.deepEqual(res.body, [{ id: 'area-1', name: 'North Village' }]);

  const failing = loadHousing({
    HousingModel: { getAll: async () => { throw new Error('db down'); } },
  });
  const errorRes = mockResponse();

  await failing.getHousing({}, errorRes);

  assert.equal(errorRes.statusCode, 500);
  assert.deepEqual(errorRes.body, { message: 'Failed to fetch housing' });
});
