# ReLoop — Frontend

React + Vite single-page application for the ReLoop platform. Communicates with the Express backend via REST API.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React 18 | UI library |
| Vite 4 | Dev server and bundler |
| React Router v6 | Client-side routing |
| Bootstrap 5 | Base styling and layout |
| lucide-react | Icon library |
| Vitest | Unit test runner |
| React Testing Library | Component testing |

---

## Folder Structure

```
frontend/
├── src/
│   ├── pages/                  # Full-page route components
│   │   ├── Home.jsx            # Landing page
│   │   ├── Housing.jsx         # Housing area browser
│   │   ├── Marketplace.jsx     # Item listings (protected)
│   │   ├── Profile.jsx         # User profile + listings (protected)
│   │   ├── Login.jsx           # Login form
│   │   ├── Register.jsx        # Registration form
│   │   └── VerifyEmail.jsx     # Post-registration email prompt
│   ├── components/             # Reusable UI components
│   │   ├── Navbar.jsx          # Top navigation bar
│   │   ├── Toast.jsx           # Global notification toast
│   │   ├── ProtectedRoute.jsx  # Redirects unauthenticated users to /login
│   │   ├── CardA.jsx           # Listing card (marketplace feed)
│   │   ├── DetailModal.jsx     # Listing detail + buy action
│   │   ├── CreateListingModal.jsx  # New listing form with image upload
│   │   ├── EditListingModal.jsx    # Edit existing listing
│   │   ├── PurchaseDetailModal.jsx # Seller nominates buyer flow
│   │   ├── ReviewModal.jsx     # Leave / edit a review
│   │   ├── HousingCard.jsx     # Housing area card
│   │   ├── HousingDetailModal.jsx  # Housing detail + reviews
│   │   └── HousingImageCarousel.jsx # Image carousel for housing
│   ├── context/
│   │   ├── AuthContext.jsx     # Auth state (token, user, login, logout)
│   │   └── AppContext.jsx      # App-wide state (listings, favorites, toast)
│   ├── data/
│   │   └── constants.js        # Shared constants (categories, API base URL)
│   ├── __tests__/              # All test files (mirrors src structure)
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── data/
│   │   └── setup.js            # Vitest global setup (jest-dom matchers)
│   ├── App.jsx                 # Root component — providers + route table
│   ├── main.jsx                # Vite entry point — mounts React into DOM
│   ├── App.css
│   └── index.css
└── index.html
```

---

## Environment Variables

Create a `frontend/.env` file (copy from `.env.example`):

```env
VITE_API_URL=http://localhost:5002/api
VITE_FRONTEND_URL=http://localhost:5173
```

For production, set these to your deployed backend and frontend URLs.

---

## Running Locally

```bash
# Install dependencies
npm install

# Start dev server (with hot module replacement)
npm run dev
```

App is available at `http://localhost:5173`.

```bash
# Build for production
npm run build
# Output goes to frontend/dist/

# Preview the production build locally
npm run preview
```

---

## Routing

Defined in `App.jsx`. The `<BrowserRouter>` is mounted in `main.jsx`.

| Path | Component | Access |
|---|---|---|
| `/` | `Home` | Public |
| `/housing` | `Housing` | Public |
| `/login` | `Login` | Public |
| `/register` | `Register` | Public |
| `/verify-email` | `VerifyEmail` | Public |
| `/marketplace` | `Marketplace` | Protected |
| `/profile` | `Profile` | Protected |

Protected routes are wrapped in `<ProtectedRoute>` which reads from `AuthContext`. Unauthenticated users are redirected to `/login`.

---

## Global State

### AuthContext (`src/context/AuthContext.jsx`)

Manages authentication state across the app.

| Value | Type | Description |
|---|---|---|
| `user` | Object \| null | Logged-in user info (id, name, email) |
| `token` | String \| null | JWT stored in memory |
| `login(token, user)` | Function | Sets auth state + persists to localStorage |
| `logout()` | Function | Clears auth state |
| `isAuthenticated` | Boolean | True when token is present |

### AppContext (`src/context/AppContext.jsx`)

Manages app-wide data fetched from the API.

| Value | Type | Description |
|---|---|---|
| `listings` | Array | All marketplace listings |
| `favoriteIds` | Array | IDs of the user's favorited listings |
| `toast` | Object | Current toast message (`{ message, type }`) |
| `showToast(msg, type)` | Function | Trigger a toast notification |
| `refreshListings()` | Function | Re-fetch listings from API |
| `refreshFavorites()` | Function | Re-fetch favorites from API |

---

## Pages

### Home (`/`)
Landing page introducing ReLoop. Links to Housing and Marketplace.

### Housing (`/housing`)
Displays all housing areas as cards. Clicking a card opens `HousingDetailModal` with photos, details, and community reviews. Anyone can read reviews; login is required to post one.

### Marketplace (`/marketplace`) — Protected
Displays all available listings as `CardA` cards. Users can:
- Filter and browse listings
- Click a card to open `DetailModal` (view details, add to favorites, contact seller)
- Create a new listing via `CreateListingModal`
- Edit or delete their own listings via `EditListingModal`
- Nominate a buyer via `PurchaseDetailModal`

### Profile (`/profile`) — Protected
Shows the logged-in user's listings, purchase history, favorites, and seller rating. Users can manage their listings and write reviews for completed purchases via `ReviewModal`.

### Login (`/login`)
Email + password form. On success, stores JWT via `AuthContext.login()` and redirects to `/marketplace`.

### Register (`/register`)
Name, email (`@umass.edu` required), password form. On success, redirects to `/verify-email`.

### VerifyEmail (`/verify-email`)
Informs the user to check their inbox. The actual verification happens when the user clicks the link in the email, which hits `GET /api/auth/verify/:token` on the backend and redirects back to `/login?verified=true`.

---

## Testing

Uses Vitest and React Testing Library.

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

### Test structure

Tests live in `src/__tests__/` and mirror the `src/` folder structure:

| Test file | What it covers |
|---|---|
| `components/CardA.test.jsx` | Listing card renders and interactions |
| `components/HousingCard.test.jsx` | Housing card renders |
| `components/Navbar.test.jsx` | Nav links, auth-aware display |
| `components/ProtectedRoute.test.jsx` | Redirects unauthenticated users |
| `components/Toast.test.jsx` | Toast display and dismissal |
| `context/AuthContext.test.jsx` | Login, logout, token persistence |
| `pages/Home.test.jsx` | Landing page renders |
| `pages/Login.test.jsx` | Form validation, submit, error states |
| `pages/Register.test.jsx` | Form validation, submit, error states |
| `pages/VerifyEmail.test.jsx` | Page renders correctly |
| `data/constants.test.js` | Constants are defined and correct |

Global test setup is in `src/__tests__/setup.js` which imports `@testing-library/jest-dom` to add DOM matchers (`.toBeInTheDocument()`, `.toHaveValue()`, etc.).
