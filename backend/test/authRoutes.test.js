const test = require('node:test');
const assert = require('node:assert/strict');
const {
  clearModules,
  loadFresh,
  mockModule,
  mockPackage,
  mockResponse,
} = require('./helpers/controllerTestUtils');

function buildRouter(overrides = {}) {
  clearModules(['routes/authRoutes.js', 'models/User.js', 'config/mailer.js']);

  const User = {
    findOne: async () => null,
    create: async () => null,
    deleteOne: async () => null,
    ...overrides.User,
  };

  const mailer = {
    sendVerificationEmail: async () => ({}),
    ...overrides.mailer,
  };

  mockModule('models/User.js', User);
  mockModule('config/mailer.js', mailer);

  // bcryptjs — provide real behaviour so hash/compare work correctly
  // unless the test wants to override
  if (overrides.bcryptjs) {
    mockPackage('bcryptjs', overrides.bcryptjs);
  }

  const router = loadFresh('routes/authRoutes.js');

  // Express Router exposes its handler stack; extract route handlers so we can
  // call them directly without spinning up an HTTP server.
  function handlerFor(method, path) {
    const layer = router.stack.find(
      l => l.route && l.route.path === path && l.route.methods[method]
    );
    if (!layer) throw new Error(`No ${method.toUpperCase()} ${path} route found`);
    // Last stack entry is the actual async handler
    const handlers = layer.route.stack;
    return handlers[handlers.length - 1].handle;
  }

  return {
    register: handlerFor('post', '/register'),
    verify: handlerFor('get', '/verify/:token'),
    login: handlerFor('post', '/login'),
  };
}

// ─── /register ───────────────────────────────────────────────────────────────

test('register rejects missing fields', async () => {
  const { register } = buildRouter();

  const res = mockResponse();
  await register({ body: { email: 'a@umass.edu', password: 'secret123' } }, res);
  assert.equal(res.statusCode, 400);

  const res2 = mockResponse();
  await register({ body: { name: 'Alice', password: 'secret123' } }, res2);
  assert.equal(res2.statusCode, 400);

  const res3 = mockResponse();
  await register({ body: { name: 'Alice', email: 'a@umass.edu' } }, res3);
  assert.equal(res3.statusCode, 400);
});

test('register rejects non-umass email addresses', async () => {
  const { register } = buildRouter();
  const res = mockResponse();
  await register({ body: { name: 'Alice', email: 'alice@gmail.com', password: 'secret123' } }, res);
  assert.equal(res.statusCode, 403);
  assert.match(res.body.message, /umass\.edu/);
});

test('register rejects passwords shorter than 6 characters', async () => {
  const { register } = buildRouter();
  const res = mockResponse();
  await register({ body: { name: 'Alice', email: 'alice@umass.edu', password: 'abc' } }, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /6 characters/);
});

test('register returns 409 when email already exists', async () => {
  const { register } = buildRouter({
    User: { findOne: async () => ({ _id: 'existing-user' }) },
  });
  const res = mockResponse();
  await register({ body: { name: 'Alice', email: 'alice@umass.edu', password: 'secret123' } }, res);
  assert.equal(res.statusCode, 409);
});

test('register succeeds without RESEND_API_KEY (skips email)', async () => {
  const prevKey = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;

  let created;
  const { register } = buildRouter({
    User: {
      findOne: async () => null,
      create: async data => { created = data; },
    },
  });
  const res = mockResponse();
  await register({ body: { name: 'Alice', email: 'alice@umass.edu', password: 'secret123' } }, res);

  assert.equal(res.statusCode, 201);
  assert.match(res.body.message, /skipped/i);
  assert.equal(created.email, 'alice@umass.edu');
  assert.equal(created.verified, false);

  process.env.RESEND_API_KEY = prevKey;
});

test('register sends verification email and returns 201 when RESEND_API_KEY is set', async () => {
  process.env.RESEND_API_KEY = 'test-key';

  let emailedTo;
  const { register } = buildRouter({
    User: {
      findOne: async () => null,
      create: async () => null,
      deleteOne: async () => null,
    },
    mailer: {
      sendVerificationEmail: async (address) => { emailedTo = address; return {}; },
    },
  });
  const res = mockResponse();
  await register({ body: { name: 'Alice', email: 'Alice@umass.edu', password: 'secret123' } }, res);

  assert.equal(res.statusCode, 201);
  assert.equal(emailedTo, 'alice@umass.edu');

  delete process.env.RESEND_API_KEY;
});

test('register rolls back user when verification email fails', async () => {
  process.env.RESEND_API_KEY = 'test-key';

  let deletedEmail;
  const { register } = buildRouter({
    User: {
      findOne: async () => null,
      create: async () => null,
      deleteOne: async ({ email }) => { deletedEmail = email; },
    },
    mailer: {
      sendVerificationEmail: async () => { throw new Error('mail error'); },
    },
  });
  const res = mockResponse();
  await register({ body: { name: 'Alice', email: 'alice@umass.edu', password: 'secret123' } }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(deletedEmail, 'alice@umass.edu');

  delete process.env.RESEND_API_KEY;
});

test('register rolls back user when Resend returns an error object', async () => {
  process.env.RESEND_API_KEY = 'test-key';

  let deletedEmail;
  const { register } = buildRouter({
    User: {
      findOne: async () => null,
      create: async () => null,
      deleteOne: async ({ email }) => { deletedEmail = email; },
    },
    mailer: {
      sendVerificationEmail: async () => ({ error: { message: 'address not found' } }),
    },
  });
  const res = mockResponse();
  await register({ body: { name: 'Alice', email: 'alice@umass.edu', password: 'secret123' } }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(deletedEmail, 'alice@umass.edu');

  delete process.env.RESEND_API_KEY;
});

test('register returns 500 on unexpected database error', async () => {
  delete process.env.RESEND_API_KEY;

  const { register } = buildRouter({
    User: {
      findOne: async () => { throw new Error('db down'); },
    },
  });
  const res = mockResponse();
  await register({ body: { name: 'Alice', email: 'alice@umass.edu', password: 'secret123' } }, res);
  assert.equal(res.statusCode, 500);
});

// ─── /verify/:token ──────────────────────────────────────────────────────────

test('verify returns 400 for an unknown or expired token', async () => {
  const { verify } = buildRouter({
    User: { findOne: async () => null },
  });
  const res = mockResponse();
  await verify({ params: { token: 'bad-token' } }, res);
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { message: 'Invalid or expired verification link.' });
});

test('verify marks user as verified and redirects on success', async () => {
  process.env.CLIENT_URL = 'http://localhost:3000';

  let saved = false;
  const user = {
    verified: false,
    verificationToken: 'abc123',
    save: async () => { saved = true; },
  };
  const { verify } = buildRouter({
    User: { findOne: async () => user },
  });
  const res = mockResponse();
  await verify({ params: { token: 'abc123' } }, res);

  assert.equal(user.verified, true);
  assert.equal(user.verificationToken, null);
  assert.equal(saved, true);
  assert.equal(res.redirectedTo, 'http://localhost:3000/login?verified=true');
});

test('verify returns 500 on unexpected database error', async () => {
  const { verify } = buildRouter({
    User: { findOne: async () => { throw new Error('db down'); } },
  });
  const res = mockResponse();
  await verify({ params: { token: 'any' } }, res);
  assert.equal(res.statusCode, 500);
});

// ─── /login ──────────────────────────────────────────────────────────────────

test('login rejects missing email or password', async () => {
  const { login } = buildRouter();

  const res1 = mockResponse();
  await login({ body: { password: 'secret123' } }, res1);
  assert.equal(res1.statusCode, 400);

  const res2 = mockResponse();
  await login({ body: { email: 'alice@umass.edu' } }, res2);
  assert.equal(res2.statusCode, 400);
});

test('login rejects non-umass email addresses', async () => {
  const { login } = buildRouter();
  const res = mockResponse();
  await login({ body: { email: 'alice@gmail.com', password: 'secret123' } }, res);
  assert.equal(res.statusCode, 403);
});

test('login returns 401 when user does not exist', async () => {
  const { login } = buildRouter({
    User: { findOne: async () => null },
  });
  const res = mockResponse();
  await login({ body: { email: 'alice@umass.edu', password: 'secret123' } }, res);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { message: 'Invalid credentials.' });
});

test('login returns 403 when email is unverified and mail is configured', async () => {
  process.env.RESEND_API_KEY = 'test-key';

  const { login } = buildRouter({
    User: {
      findOne: async () => ({
        _id: 'user-1',
        email: 'alice@umass.edu',
        name: 'Alice',
        verified: false,
        passwordHash: 'hash',
      }),
    },
  });
  const res = mockResponse();
  await login({ body: { email: 'alice@umass.edu', password: 'secret123' } }, res);
  assert.equal(res.statusCode, 403);
  assert.match(res.body.message, /verify/i);

  delete process.env.RESEND_API_KEY;
});

test('login returns 401 when password does not match', async () => {
  delete process.env.RESEND_API_KEY;

  const bcrypt = require('bcryptjs');
  const correctHash = await bcrypt.hash('correct-password', 10);

  const { login } = buildRouter({
    User: {
      findOne: async () => ({
        _id: 'user-1',
        email: 'alice@umass.edu',
        name: 'Alice',
        verified: true,
        passwordHash: correctHash,
      }),
    },
  });
  const res = mockResponse();
  await login({ body: { email: 'alice@umass.edu', password: 'wrong-password' } }, res);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { message: 'Invalid credentials.' });
});

test('login returns token and user info on success', async () => {
  process.env.JWT_SECRET = 'test-secret';
  delete process.env.RESEND_API_KEY;

  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash('secret123', 10);

  const { login } = buildRouter({
    User: {
      findOne: async () => ({
        _id: 'user-1',
        email: 'alice@umass.edu',
        name: 'Alice',
        verified: true,
        passwordHash,
      }),
    },
  });
  const res = mockResponse();
  await login({ body: { email: 'alice@umass.edu', password: 'secret123' } }, res);

  assert.equal(res.statusCode, 200);
  assert.ok(res.body.token);
  assert.deepEqual(res.body.user, { id: 'user-1', name: 'Alice', email: 'alice@umass.edu' });
});

test('login skips verification check and logs in when RESEND_API_KEY is not set', async () => {
  process.env.JWT_SECRET = 'test-secret';
  delete process.env.RESEND_API_KEY;

  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash('secret123', 10);

  const { login } = buildRouter({
    User: {
      findOne: async () => ({
        _id: 'user-1',
        email: 'alice@umass.edu',
        name: 'Alice',
        verified: false,
        passwordHash,
      }),
    },
  });
  const res = mockResponse();
  await login({ body: { email: 'alice@umass.edu', password: 'secret123' } }, res);

  assert.equal(res.statusCode, 200);
  assert.ok(res.body.token);
});

test('login returns 500 on unexpected database error', async () => {
  const { login } = buildRouter({
    User: { findOne: async () => { throw new Error('db down'); } },
  });
  const res = mockResponse();
  await login({ body: { email: 'alice@umass.edu', password: 'secret123' } }, res);
  assert.equal(res.statusCode, 500);
});
