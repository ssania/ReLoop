# ReLoop — Backend

Node.js/Express REST API for the ReLoop platform. Handles authentication, listings, housing, reviews, favorites, and image uploads.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| Express 4 | HTTP server and routing |
| Mongoose 8 | MongoDB ODM |
| jsonwebtoken | JWT generation and verification |
| bcryptjs | Password hashing |
| AWS S3 + multer-s3 | Listing image storage |
| Resend | Transactional email (verification) |
| Winston | Structured request logging |
| Node.js test runner | Unit testing (no extra deps) |

---

## Folder Structure

```
backend/
├── config/
│   ├── db.js               # MongoDB connection
│   ├── mailer.js           # Resend email templates
│   ├── s3.js               # AWS S3 client + multer-s3 middleware
│   └── testS3.js           # Mock S3 for tests
├── controllers/
│   ├── favoriteController.js
│   ├── housingController.js
│   ├── housingReviewController.js
│   ├── listingController.js
│   └── reviewController.js
├── middleware/
│   └── authMiddeware.js    # JWT Bearer token validation
├── models/
│   ├── User.js
│   ├── Listing.js
│   ├── Housing.js
│   ├── Review.js
│   └── HousingReview.js
├── routes/
│   ├── authRoutes.js       # Auth logic lives inline here
│   ├── listingRoutes.js
│   ├── housingRoutes.js
│   ├── reviewRoutes.js
│   └── favoriteRoutes.js
├── test/
│   ├── helpers/
│   │   └── controllerTestUtils.js
│   ├── authRoutes.test.js
│   ├── authMiddleware.test.js
│   ├── listingController.test.js
│   ├── reviewController.test.js
│   ├── housingReviewController.test.js
│   └── favoriteAndHousingController.test.js
├── data/                   # Seed data files
├── logger.js               # Winston logger instance
├── seed.js                 # DB seeding script
└── server.js               # App entry point
```

---

## Environment Variables

Create a `backend/.env` file (copy from `.env.example`):

```env
PORT=5002
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/reloop
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

RESEND_API_KEY=your_resend_api_key_here

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
S3_BUCKET_NAME=your_bucket_name_here

CLIENT_URL=http://localhost:5173
```

> If `RESEND_API_KEY` is omitted, email verification is skipped and users can log in immediately after registering.

---

## Running the Server

```bash
# Development (auto-restarts on file change)
npm run dev

# Build frontend + start production server
npm run build   # runs: cd ../frontend && npm install && npm run build
npm start       # runs: node server.js
```

- **Development:** server starts on `http://localhost:5002`. Health check: `GET /` → `{ "message": "ReLoop API is running" }`
- **Production** (`NODE_ENV=production`): Express serves `frontend/dist/` as static files. All `/*` routes return `index.html` so React Router handles navigation. Only `/api/*` routes are handled by Express.

See [BUILD.md](../BUILD.md) for full Render deployment settings and environment variable reference.

---

## Data Models

### User
| Field | Type | Notes |
|---|---|---|
| name | String | Required |
| email | String | Required, unique, lowercased |
| passwordHash | String | bcrypt hash |
| role | String | `student` or `admin` |
| verified | Boolean | Email verification status |
| verificationToken | String | Cleared after verification |
| avgRating | Number | Recalculated on each review |
| totalReviews | Number | Recalculated on each review |
| listings | [ObjectId] | Refs to Listing |
| bought | [ObjectId] | Refs to Listing |
| favorites | [ObjectId] | Refs to Listing |

### Listing
| Field | Type | Notes |
|---|---|---|
| title | String | Required |
| description | String | |
| price | Number | Required |
| category | String | |
| status | String | `Available` → `pending-confirmation` → `Sold` |
| owner | ObjectId | Ref to User |
| buyer | ObjectId | Ref to User, set on nomination |
| imageUrls | Array | `[{ url, key }]` — key used for S3 deletion |

### Review
| Field | Type | Notes |
|---|---|---|
| reviewer | ObjectId | Ref to User (buyer) |
| targetUser | ObjectId | Ref to User (seller) |
| listingRef | ObjectId | Ref to Listing |
| stars | Number | 1–5 |
| comment | String | |

### HousingReview
| Field | Type | Notes |
|---|---|---|
| reviewer | ObjectId | Ref to User |
| area | ObjectId | Ref to Housing |
| stars | Number | 1–5 |
| comment | String | |

### Housing
| Field | Type | Notes |
|---|---|---|
| name | String | Housing area name |
| averageRating | Number | Recalculated on each review |
| reviewCount | Number | Recalculated on each review |

---

## API Routes

All routes are prefixed with `/api`. Protected routes require:
```
Authorization: Bearer <jwt_token>
```

### Auth — `/api/auth`
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register with `@umass.edu` email |
| POST | `/auth/login` | Public | Login, returns JWT + user info |
| GET | `/auth/verify/:token` | Public | Verify email, redirects to frontend |

### Listings — `/api/listings`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/listings` | Public | Get all listings |
| POST | `/listings` | Protected | Create listing (up to 5 images) |
| PATCH | `/listings/:id` | Protected | Update listing fields |
| PATCH | `/listings/:id/nominate` | Protected | Nominate a buyer by email |
| PATCH | `/listings/:id/confirm` | Protected | Buyer confirms purchase → Sold |
| PATCH | `/listings/:id/reject` | Protected | Buyer rejects → back to Available |
| DELETE | `/listings/:id` | Protected | Delete listing + S3 images |

### Housing — `/api/housing`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/housing` | Public | Get all housing areas |
| GET | `/housing/:areaId/reviews` | Public | Get reviews for a housing area |
| POST | `/housing/:areaId/reviews` | Protected | Create a housing review |
| PATCH | `/housing/reviews/:reviewId` | Protected | Update own housing review |
| DELETE | `/housing/reviews/:reviewId` | Protected | Delete own housing review |

### Reviews — `/api/reviews`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/reviews` | Public | Get reviews for a seller (`?sellerId=`) |
| GET | `/reviews/given` | Protected | Reviews written by logged-in user |
| GET | `/reviews/seller/:id` | Public | Seller avg rating + total reviews |
| POST | `/reviews` | Protected | Create review (buyer only, once per listing) |
| PATCH | `/reviews/:id` | Protected | Update own review |
| DELETE | `/reviews/:id` | Protected | Delete own review |

### Favorites — `/api/favorites`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/favorites` | Protected | Get logged-in user's favorites |
| POST | `/favorites/:id` | Protected | Add listing to favorites |
| DELETE | `/favorites/:id` | Protected | Remove listing from favorites |

---

## Authentication Flow

1. User registers with `name`, `email` (`@umass.edu`), `password`
2. Password is hashed with bcrypt (10 rounds) and stored
3. A `verificationToken` is generated and emailed via Resend
4. User clicks the link → `GET /auth/verify/:token` → account marked `verified: true`
5. User logs in → server returns a JWT (7-day expiry)
6. Client sends `Authorization: Bearer <token>` on protected requests
7. `authMiddleware` validates the token and attaches `req.user`

---

## Listing Purchase Flow

```
Available
   │
   ▼  PATCH /listings/:id/nominate  (seller picks a buyer by email)
pending-confirmation
   │
   ├──▶  PATCH /listings/:id/confirm  (buyer accepts)  ──▶  Sold
   │
   └──▶  PATCH /listings/:id/reject   (buyer declines) ──▶  Available
```

Email notifications are sent at each step via Resend.

---

## Testing

Uses the Node.js built-in `node:test` module — no external test framework needed.

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

### Test structure

Each test file mirrors a controller or middleware:

| Test file | What it covers |
|---|---|
| `authRoutes.test.js` | Register, verify, login — all branches |
| `authMiddleware.test.js` | Missing, expired, invalid tokens |
| `listingController.test.js` | Full CRUD + nominate/confirm/reject |
| `reviewController.test.js` | CRUD + rating recalculation |
| `housingReviewController.test.js` | CRUD + ownership + aggregate stats |
| `favoriteAndHousingController.test.js` | Favorites add/remove + housing fetch |

### How mocking works

All tests use `test/helpers/controllerTestUtils.js` which injects fakes directly into Node's `require.cache` — no monkey-patching libraries needed:

- `mockModule(path, exports)` — replace a local module
- `mockPackage(name, exports)` — replace an npm package
- `loadFresh(path)` — load a module bypassing cache
- `mockResponse()` — fake Express `res` object
- `makeQueryChain(result)` — chainable Mongoose query mock

### Coverage results

| File | Lines | Branches | Functions |
|---|---|---|---|
| favoriteController.js | 100% | 100% | 100% |
| housingController.js | 100% | 100% | 100% |
| housingReviewController.js | 100% | 89% | 100% |
| listingController.js | 97% | 91% | 100% |
| reviewController.js | 100% | 100% | 100% |
| authMiddleware.js | 100% | 100% | 100% |
| **Overall** | **99%** | **95%** | **100%** |
