const test = require('node:test');
const assert = require('node:assert/strict');
const {
  clearModules,
  loadFresh,
  makePopulateChain,
  mockModule,
  mockPackage,
  mockResponse,
} = require('./helpers/controllerTestUtils');

function loadController(overrides = {}) {
  clearModules([
    'controllers/listingController.js',
    'models/Listing.js',
    'models/User.js',
    'config/mailer.js',
    'config/s3.js',
  ]);

  const ListingMongoose = {
    findById: async () => null,
    findByIdAndDelete: async () => null,
    ...overrides.ListingMongoose,
  };
  const ListingModel = {
    getAll: async () => [],
    create: async data => data,
    update: async () => null,
    ListingMongoose,
    ...overrides.ListingModel,
  };
  ListingModel.ListingMongoose = ListingMongoose;

  const User = {
    findOne: async () => null,
    findByIdAndUpdate: async () => null,
    ...overrides.User,
  };
  const mailer = {
    sendBuyerNomination: async () => ({}),
    sendSellerConfirmation: async () => ({}),
    ...overrides.mailer,
  };
  const s3 = { send: async command => command, ...overrides.s3 };

  class DeleteObjectsCommand {
    constructor(input) {
      this.input = input;
    }
  }

  mockModule('models/Listing.js', ListingModel);
  mockModule('models/User.js', User);
  mockModule('config/mailer.js', mailer);
  mockModule('config/s3.js', { s3 });
  mockPackage('@aws-sdk/client-s3', { DeleteObjectsCommand });

  return { controller: loadFresh('controllers/listingController.js'), ListingModel, ListingMongoose, User, mailer, s3 };
}

test('getListings returns listings and handles model errors', async () => {
  const { controller } = loadController({
    ListingModel: { getAll: async () => [{ id: 'listing-1', title: 'Desk' }] },
  });
  const res = mockResponse();

  await controller.getListings({}, res);

  assert.deepEqual(res.body, [{ id: 'listing-1', title: 'Desk' }]);

  const failing = loadController({
    ListingModel: { getAll: async () => { throw new Error('db down'); } },
  }).controller;
  const errorRes = mockResponse();

  await failing.getListings({}, errorRes);

  assert.equal(errorRes.statusCode, 500);
  assert.deepEqual(errorRes.body, { message: 'Failed to fetch listings' });
});

test('createListing uses authenticated owner and S3 file metadata', async () => {
  let created;
  const { controller } = loadController({
    ListingModel: {
      create: async data => {
        created = data;
        return { id: 'new-listing', ...data };
      },
    },
  });
  const req = {
    user: { id: 'owner-1' },
    body: { owner: 'spoofed-owner', title: 'Lamp', price: 12 },
    files: [{ location: 'https://s3/img.jpg', key: 'listings/img.jpg' }],
  };
  const res = mockResponse();

  await controller.createListing(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(created.owner, 'owner-1');
  assert.equal(created.title, 'Lamp');
  assert.deepEqual(created.imageUrls, [{ url: 'https://s3/img.jpg', key: 'listings/img.jpg' }]);
  assert.equal(res.body.id, 'new-listing');

  const failing = loadController({
    ListingModel: { create: async () => { throw new Error('db down'); } },
  }).controller;
  const errorRes = mockResponse();
  await failing.createListing({ user: { id: 'owner-1' }, body: {}, files: [] }, errorRes);
  assert.equal(errorRes.statusCode, 500);
  assert.deepEqual(errorRes.body, { message: 'Failed to create listing' });
});

test('updateListing returns updated, not-found, and error responses', async () => {
  const success = loadController({
    ListingModel: { update: async (id, body) => ({ id, ...body }) },
  }).controller;
  const successRes = mockResponse();

  await success.updateListing({ params: { id: 'listing-1' }, body: { price: 20 } }, successRes);

  assert.deepEqual(successRes.body, { id: 'listing-1', price: 20 });

  const notFound = loadController({
    ListingModel: { update: async () => null },
  }).controller;
  const notFoundRes = mockResponse();

  await notFound.updateListing({ params: { id: 'missing' }, body: {} }, notFoundRes);

  assert.equal(notFoundRes.statusCode, 404);

  const failing = loadController({
    ListingModel: { update: async () => { throw new Error('db down'); } },
  }).controller;
  const errorRes = mockResponse();

  await failing.updateListing({ params: { id: 'listing-1' }, body: {} }, errorRes);

  assert.equal(errorRes.statusCode, 500);
});

test('deleteListing deletes S3 images before removing the listing', async () => {
  process.env.S3_BUCKET_NAME = 'test-bucket';
  const sent = [];
  let deletedId;
  const { controller } = loadController({
    ListingMongoose: {
      findById: () => ({ lean: async () => ({
        _id: 'listing-1',
        imageUrls: [{ key: 'listings/a.jpg' }, { key: 'listings/b.jpg' }],
      }) }),
      findByIdAndDelete: async id => { deletedId = id; },
    },
    s3: { send: async command => { sent.push(command.input); } },
  });
  const res = mockResponse();

  await controller.deleteListing({ params: { id: 'listing-1' } }, res);

  assert.equal(res.statusCode, 204);
  assert.equal(deletedId, 'listing-1');
  assert.deepEqual(sent[0], {
    Bucket: 'test-bucket',
    Delete: { Objects: [{ Key: 'listings/a.jpg' }, { Key: 'listings/b.jpg' }] },
  });
});

test('deleteListing returns 404 when listing is missing', async () => {
  const { controller } = loadController({
    ListingMongoose: { findById: () => ({ lean: async () => null }) },
  });
  const res = mockResponse();

  await controller.deleteListing({ params: { id: 'missing' } }, res);

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, { message: 'Listing not found' });

  const failing = loadController({
    ListingMongoose: { findById: () => ({ lean: async () => { throw new Error('db down'); } }) },
  }).controller;
  const errorRes = mockResponse();
  await failing.deleteListing({ params: { id: 'listing-1' } }, errorRes);
  assert.equal(errorRes.statusCode, 500);
  assert.deepEqual(errorRes.body, { message: 'Failed to delete listing' });
});

test('nominateBuyer validates input and sends nomination email on success', async () => {
  const missingEmail = loadController().controller;
  const missingRes = mockResponse();
  await missingEmail.nominateBuyer({ body: {}, params: { id: 'listing-1' } }, missingRes);
  assert.equal(missingRes.statusCode, 400);

  const buyerNotFound = loadController({
    User: { findOne: async () => null },
  }).controller;
  const buyerRes = mockResponse();
  await buyerNotFound.nominateBuyer({ body: { buyerEmail: 'buyer@umass.edu' }, params: { id: 'listing-1' } }, buyerRes);
  assert.equal(buyerRes.statusCode, 404);

  const missingListing = loadController({
    User: { findOne: async () => ({ _id: 'buyer-1', email: 'buyer@umass.edu', name: 'Buyer' }) },
    ListingMongoose: { findById: () => makePopulateChain(null) },
  }).controller;
  const missingListingRes = mockResponse();
  await missingListing.nominateBuyer({ body: { buyerEmail: 'buyer@umass.edu' }, params: { id: 'missing' } }, missingListingRes);
  assert.equal(missingListingRes.statusCode, 404);

  let saved = false;
  let emailPayload;
  const listing = {
    _id: 'listing-1',
    owner: { name: 'Seller', email: 'seller@umass.edu' },
    title: 'Bike',
    price: 100,
    save: async () => { saved = true; },
  };
  const success = loadController({
    User: { findOne: async () => ({ _id: 'buyer-1', email: 'buyer@umass.edu', name: 'Buyer' }) },
    ListingMongoose: { findById: () => makePopulateChain(listing) },
    mailer: { sendBuyerNomination: async payload => { emailPayload = payload; } },
  }).controller;
  const successRes = mockResponse();

  await success.nominateBuyer({ body: { buyerEmail: 'buyer@umass.edu' }, params: { id: 'listing-1' } }, successRes);

  assert.equal(successRes.statusCode, 200);
  assert.equal(listing.buyer, 'buyer-1');
  assert.equal(listing.status, 'pending-confirmation');
  assert.equal(saved, true);
  assert.equal(emailPayload.listingTitle, 'Bike');
  assert.deepEqual(successRes.body, { message: 'Buyer nominated', listingId: 'listing-1' });

  const failing = loadController({
    User: { findOne: async () => { throw new Error('db down'); } },
  }).controller;
  const errorRes = mockResponse();
  await failing.nominateBuyer({ body: { buyerEmail: 'buyer@umass.edu' }, params: { id: 'listing-1' } }, errorRes);
  assert.equal(errorRes.statusCode, 500);
});

test('confirmPurchase and rejectPurchase enforce pending state and notify seller', async () => {
  const soldListing = {
    _id: 'listing-1',
    status: 'pending-confirmation',
    owner: { email: 'seller@umass.edu', name: 'Seller' },
    buyer: { _id: 'buyer-1', name: 'Buyer', email: 'buyer@umass.edu' },
    title: 'Chair',
    save: async () => {},
  };
  let boughtUpdate;
  let sellerEmail;
  const confirm = loadController({
    ListingMongoose: { findById: () => makePopulateChain(soldListing) },
    User: { findByIdAndUpdate: async (...args) => { boughtUpdate = args; } },
    mailer: { sendSellerConfirmation: async payload => { sellerEmail = payload; } },
  }).controller;
  const confirmRes = mockResponse();

  await confirm.confirmPurchase({ params: { id: 'listing-1' } }, confirmRes);

  assert.equal(soldListing.status, 'Sold');
  assert.deepEqual(boughtUpdate, ['buyer-1', { $addToSet: { bought: 'listing-1' } }]);
  assert.equal(sellerEmail.confirmed, true);
  assert.deepEqual(confirmRes.body, { message: 'Purchase confirmed', listingId: 'listing-1' });

  const notPending = loadController({
    ListingMongoose: { findById: () => makePopulateChain({ status: 'Available' }) },
  }).controller;
  const notPendingRes = mockResponse();
  await notPending.confirmPurchase({ params: { id: 'listing-1' } }, notPendingRes);
  assert.equal(notPendingRes.statusCode, 400);

  const missingConfirm = loadController({
    ListingMongoose: { findById: () => makePopulateChain(null) },
  }).controller;
  const missingConfirmRes = mockResponse();
  await missingConfirm.confirmPurchase({ params: { id: 'missing' } }, missingConfirmRes);
  assert.equal(missingConfirmRes.statusCode, 404);

  const rejectedListing = {
    _id: 'listing-2',
    status: 'pending-confirmation',
    owner: { email: 'seller@umass.edu', name: 'Seller' },
    buyer: { _id: 'buyer-1', name: 'Buyer' },
    title: 'Table',
    save: async () => {},
  };
  let rejectEmail;
  const reject = loadController({
    ListingMongoose: { findById: () => makePopulateChain(rejectedListing) },
    mailer: { sendSellerConfirmation: async payload => { rejectEmail = payload; } },
  }).controller;
  const rejectRes = mockResponse();

  await reject.rejectPurchase({ params: { id: 'listing-2' } }, rejectRes);

  assert.equal(rejectedListing.status, 'Available');
  assert.equal(rejectedListing.buyer, null);
  assert.equal(rejectEmail.confirmed, false);
  assert.deepEqual(rejectRes.body, { message: 'Purchase rejected', listingId: 'listing-2' });

  const missingReject = loadController({
    ListingMongoose: { findById: () => makePopulateChain(null) },
  }).controller;
  const missingRejectRes = mockResponse();
  await missingReject.rejectPurchase({ params: { id: 'missing' } }, missingRejectRes);
  assert.equal(missingRejectRes.statusCode, 404);

  const badRejectState = loadController({
    ListingMongoose: { findById: () => makePopulateChain({ status: 'Available' }) },
  }).controller;
  const badRejectStateRes = mockResponse();
  await badRejectState.rejectPurchase({ params: { id: 'listing-2' } }, badRejectStateRes);
  assert.equal(badRejectStateRes.statusCode, 400);
});
