/**
 * app.js
 * Express application factory — exported separately from server.js
 * so that tests can import the app without starting the HTTP server
 * or requiring a live database connection.
 */

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Routes
const accommodationRoutes = require('./routes/accommodationRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// ─── Security & Core Middleware ───────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/users', userRoutes);

// ─── Serve React frontends in production ─────────────────────────────────────
// The admin dashboard is served at /admin, the public site at /
if (process.env.NODE_ENV === 'production') {
  // Serve admin frontend static files at /admin
  app.use('/admin', express.static(path.join(__dirname, 'admin-frontend/dist')));
  app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-frontend/dist/index.html'));
  });

  // Serve public Airbnb frontend static files at /
  app.use(express.static(path.join(__dirname, 'airbnb-frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'airbnb-frontend/dist/index.html'));
  });
} else {
  // Development: health check at root
  app.get('/', (req, res) => {
    res.json({ message: 'Airbnb Clone API is running', status: 'OK' });
  });
}

// ─── Error Handlers ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
