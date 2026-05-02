const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// ✅ NEW: import logger
const logger = require('./logger');

dotenv.config();

const app = express();

connectDB();

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ✅ NEW: Logging middleware (ADD HERE)
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      latency: Date.now() - start,
    });
  });

  next();
});

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/housing',  require('./routes/housingRoutes'));
app.use('/api/reviews',  require('./routes/reviewRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));

// ✅ ADD HERE
app.get("/test-500", (req, res) => {
  res.status(500).send("Test 500 error");
});

// Health-check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'ReLoop API is running' });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
