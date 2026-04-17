const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

connectDB();

// ── Middleware ─────────────────────────────────────────────────────────────────
// cors() allows the React dev server (localhost:5173) to call this API.
// Without this the browser would block cross-origin requests.
app.use(cors());

// express.json() parses incoming JSON request bodies (needed for POST /api/listings).
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────────────────────
// Each router handles a resource. Prefix all API routes with /api/ so they are
// clearly separated from any static file serving added later.
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/housing',  require('./routes/housingRoutes'));
app.use('/api/reviews',  require('./routes/reviewRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));

// Health-check endpoint – useful for confirming the server is up.
app.get('/', (req, res) => {
  res.json({ message: 'ReLoop API is running' });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));