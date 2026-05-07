# ReLoop

ReLoop is a full-stack web application for students at the University of Massachusetts Amherst and the broader Five College community. It solves two problems students face every semester:

1. **Finding housing** — a centralized hub for exploring housing areas near campus, with community reviews and ratings.
2. **Buying and selling items** — a verified student-only marketplace where only `@umass.edu` accounts can list and purchase items, keeping the community safe and trusted.

Unlike general platforms (Facebook Marketplace, Craigslist), ReLoop is purpose-built for UMass students with email verification, a purchase confirmation workflow, and seller ratings.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6, Bootstrap 5 |
| Backend | Node.js, Express 4 |
| Database | MongoDB (Mongoose) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| File Storage | AWS S3 (listing images) |
| Email | Resend (email verification) |
| Logging | Winston |
| Backend Tests | Node.js built-in test runner |
| Frontend Tests | Vitest + React Testing Library |

---

## Quick Start

See [BUILD.md](BUILD.md) for full installation, environment variable setup, seeding, and deployment instructions.

```bash
# 1. Clone
git clone https://github.com/ssania/ReLoop.git
cd ReLoop

# 2. Backend (Terminal 1)
cd backend && npm install && npm run dev

# 3. Frontend (Terminal 2)
cd frontend && npm install && npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5002`

---

## Repository Structure

```
ReLoop/
├── backend/        # Express API — see backend/BACKEND.md
├── frontend/       # React app — see frontend/README.md
├── BUILD.md        # Full installation & deployment guide
└── README.md       # This file
```

---

## Key Features

- `@umass.edu`-only registration with email verification
- Browse housing areas and leave reviews (public)
- Create, edit, and delete item listings with image uploads
- Nominate a buyer → buyer confirms or rejects → listing marked Sold
- Seller ratings calculated from buyer reviews
- Favorites list per user
- Protected routes — marketplace and profile require login
