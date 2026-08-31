/**
 * routes/reservationRoutes.js
 * CRUD routes for reservations.
 * All routes require authentication.
 */

const express = require('express');
const router = express.Router();
const {
  createReservation,
  getReservationsByHost,
  getReservationsByUser,
  getAllReservations,
  deleteReservation,
} = require('../controllers/reservationController');
const { protect, adminOnly } = require('../middleware/auth');

// All reservation routes require a valid JWT
router.use(protect);

router.post('/', createReservation);                      // POST   /api/reservations
router.get('/host', getReservationsByHost);               // GET    /api/reservations/host
router.get('/user', getReservationsByUser);               // GET    /api/reservations/user
router.get('/', adminOnly, getAllReservations);            // GET    /api/reservations (admin)
router.delete('/:id', deleteReservation);                 // DELETE /api/reservations/:id

module.exports = router;
