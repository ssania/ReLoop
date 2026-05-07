const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { mockResponse } = require('./helpers/controllerTestUtils');

const requireAuth = require('../middleware/authMiddeware');

test('auth middleware rejects requests without a bearer token', () => {
  const req = { headers: {} };
  const res = mockResponse();
  let calledNext = false;

  requireAuth(req, res, () => { calledNext = true; });

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { message: 'No token provided. Access denied.' });
  assert.equal(calledNext, false);
});

test('auth middleware attaches decoded user and calls next for a valid token', () => {
  process.env.JWT_SECRET = 'test-secret';
  const token = jwt.sign({ id: 'user-1', email: 'a@umass.edu' }, process.env.JWT_SECRET);
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = mockResponse();
  let calledNext = false;

  requireAuth(req, res, () => { calledNext = true; });

  assert.equal(calledNext, true);
  assert.equal(req.user.id, 'user-1');
  assert.equal(res.statusCode, 200);
});

test('auth middleware distinguishes expired and invalid tokens', () => {
  process.env.JWT_SECRET = 'test-secret';

  const expired = jwt.sign({ id: 'user-1' }, process.env.JWT_SECRET, { expiresIn: '-1s' });
  const expiredReq = { headers: { authorization: `Bearer ${expired}` } };
  const expiredRes = mockResponse();
  requireAuth(expiredReq, expiredRes, () => {});
  assert.equal(expiredRes.statusCode, 401);
  assert.deepEqual(expiredRes.body, { message: 'Token expired. Please log in again.' });

  const invalidReq = { headers: { authorization: 'Bearer not-a-real-token' } };
  const invalidRes = mockResponse();
  requireAuth(invalidReq, invalidRes, () => {});
  assert.equal(invalidRes.statusCode, 401);
  assert.deepEqual(invalidRes.body, { message: 'Invalid token. Access denied.' });
});
