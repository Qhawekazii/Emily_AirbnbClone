/**
 * server.js
 * Entry point for the Airbnb Clone Node.js backend.
 * Sets up Express, middleware, database connection, and routes.
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Import routes
const accommodationRoutes = require('./routes/accommodationRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Airbnb Clone API is running', status: 'OK' });
});

// ─── 404 + Global Error Handlers ─────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Database + Server Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
