const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Connect to MongoDB (uncomment when MONGO_URI is configured in .env)
// connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes (add as you build them)
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/listings', require('./routes/listingRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'ReLoop API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
