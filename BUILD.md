# ReLoop — Build & Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Environment Variables](#environment-variables)
4. [Installation](#installation)
5. [Running Locally](#running-locally)
6. [Seeding the Database](#seeding-the-database)
7. [Running Tests](#running-tests)
8. [Deployment](#deployment)
9. [API Overview](#api-overview)

---

## Prerequisites

Make sure the following are installed before you begin:

| Tool | Minimum Version | Download |
|---|---|---|
| Node.js | v18 | https://nodejs.org |
| npm | v9 | Bundled with Node.js |
| Git | Any recent | https://git-scm.com |

You will also need accounts/access for:
- **MongoDB Atlas** — cloud database
- **AWS S3** — image storage for listings
- **Resend** — transactional email (email verification)

---

## Project Structure

```
ReLoop/
├── backend/
│   ├── config/             # DB, S3, and mailer configuration
│   ├── controllers/        # Business logic for each route
│   ├── middleware/         # JWT authentication middleware
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express route definitions
│   ├── test/               # Backend unit tests
│   │   └── helpers/        # Shared test utilities
│   ├── data/               # Seed data files
│   ├── logger.js           # Winston logger
│   ├── seed.js             # Database seeding script
│   └── server.js           # Express app entry point
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context (auth + app state)
│   │   ├── pages/          # Page-level components
│   │   ├── data/           # Static data files
│   │   └── __tests__/      # Frontend tests
│   └── index.html
├── README.md
└── BUILD.md
```

---

## Environment Variables

### Backend — `backend/.env`

Create a file called `.env` inside the `backend/` folder. Use `backend/.env.example` as a template:

```env
PORT=5002
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/reloop
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Resend — transactional email (required for email verification)
RESEND_API_KEY=your_resend_api_key_here

# AWS S3 — required for listing image uploads
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
S3_BUCKET_NAME=your_bucket_name_here

# Frontend URL — used to build email verification redirect links
CLIENT_URL=http://localhost:5173
```

> If `RESEND_API_KEY` is not set, the app will still run but email verification will be skipped — users can log in without verifying their email.

### Frontend — `frontend/.env`

Create a file called `.env` inside the `frontend/` folder. Use `frontend/.env.example` as a template:

```env
VITE_API_URL=http://localhost:5002/api
VITE_FRONTEND_URL=http://localhost:5173
```

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/ssania/ReLoop.git
cd ReLoop
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

Open a new terminal from the project root:

```bash
cd frontend
npm install
```

---

## Running Locally

Both the backend and frontend must run at the same time in separate terminals.

### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

The API will be available at `http://localhost:5002`.  
Health check: `GET http://localhost:5002/` should return `{ "message": "ReLoop API is running" }`.

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Seeding the Database

Run this **once** before starting the backend to populate MongoDB with sample housing areas, listings, and users:

```bash
cd backend
node seed.js
```

> Only run this on a fresh database. Running it multiple times may create duplicate records.

---

## Running Tests

### Backend tests

Uses Node.js built-in test runner — no extra dependencies required.

```bash
cd backend

# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage
```

Coverage is reported for `controllers/` and `middleware/`.

### Frontend tests

Uses Vitest and React Testing Library.

```bash
cd frontend

# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage
```

---

## Deployment

### Backend

The backend is a standard Node.js/Express app and can be deployed to any Node-compatible host (AWS EC2, Railway, Render, etc.).

**Production start command:**
```bash
npm start
```

Make sure all environment variables from `backend/.env` are set in your hosting provider's dashboard.

**Required for production:**
- `MONGO_URI` pointing to your production MongoDB Atlas cluster
- `JWT_SECRET` set to a long, random string
- `RESEND_API_KEY` for email verification to work
- All AWS S3 variables for image uploads to work
- `CLIENT_URL` set to your deployed frontend URL (e.g. `https://reloop.vercel.app`)

### Frontend

The frontend is a Vite/React app. Build the static bundle and deploy it to any static host (Vercel, Netlify, AWS S3, etc.).

```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/`. Point your host to serve that folder.

**Required for production:**
- `VITE_API_URL` set to your deployed backend URL (e.g. `https://api.reloop.com/api`)
- `VITE_FRONTEND_URL` set to your deployed frontend URL

---

## API Overview

All API routes are prefixed with `/api`. Protected routes require a `Bearer` token in the `Authorization` header.

### Auth — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register with a `@umass.edu` email |
| POST | `/auth/login` | Public | Login and receive a JWT token |
| GET | `/auth/verify/:token` | Public | Verify email address via token link |

### Listings — `/api/listings`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/listings` | Public | Get all listings |
| POST | `/listings` | Protected | Create a listing (up to 5 images) |
| PATCH | `/listings/:id` | Protected | Update a listing |
| PATCH | `/listings/:id/nominate` | Protected | Nominate a buyer |
| PATCH | `/listings/:id/confirm` | Protected | Confirm a purchase |
| PATCH | `/listings/:id/reject` | Protected | Reject a purchase |
| DELETE | `/listings/:id` | Protected | Delete a listing |

### Housing — `/api/housing`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/housing` | Public | Get all housing areas |

### Reviews — `/api/reviews`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/reviews` | Public | Get reviews for a seller |
| GET | `/reviews/given` | Protected | Get reviews written by the logged-in user |
| GET | `/reviews/seller/:id` | Public | Get seller rating stats |
| POST | `/reviews` | Protected | Create a review |
| PATCH | `/reviews/:id` | Protected | Update a review |
| DELETE | `/reviews/:id` | Protected | Delete a review |

### Housing Reviews — `/api/housing`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/housing/:areaId/reviews` | Public | Get reviews for a housing area |
| POST | `/housing/:areaId/reviews` | Protected | Create a housing review |
| PATCH | `/housing/reviews/:reviewId` | Protected | Update a housing review |
| DELETE | `/housing/reviews/:reviewId` | Protected | Delete a housing review |

### Favorites — `/api/favorites`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/favorites` | Protected | Get the logged-in user's favorites |
| POST | `/favorites/:id` | Protected | Add a listing to favorites |
| DELETE | `/favorites/:id` | Protected | Remove a listing from favorites |
