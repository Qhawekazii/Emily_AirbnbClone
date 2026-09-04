/**
 * controllers/reservationController.js
 * CRUD operations for reservations.
 * Create/Delete require authentication.
 * Host can view all reservations for their listings.
 * Users can view their own reservations.
 */

const Reservation = require('../models/Reservation');
const Accommodation = require('../models/Accommodation');

// ─── POST /api/reservations ───────────────────────────────────────────────────
/**
 * Create a new reservation.
 * Body: { accommodation, checkIn, checkOut, guests }
 */
const createReservation = async (req, res) => {
  try {
    const { accommodation: accommodationId, checkIn, checkOut, guests } = req.body;

    // Validate required fields
    if (!accommodationId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({
        message: 'Accommodation ID, check-in date, check-out date, and guest count are all required',
      });
    }

    // Validate dates are parseable
    const checkInDate  = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format for check-in or check-out' });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    // Fetch listing
    const listing = await Accommodation.findById(accommodationId);
    if (!listing) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    const nights      = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const guestNum    = Number(guests);

    // Validate guest count against listing max
    if (guestNum > listing.guests) {
      return res.status(400).json({
        message: `This listing allows a maximum of ${listing.guests} guest${listing.guests !== 1 ? 's' : ''}`,
      });
    }

    // ── Cost calculation ──────────────────────────────────────────────────────
    let baseTotal      = listing.price * nights;
    let discountAmount = 0;

    if (nights >= 7 && listing.weeklyDiscount > 0) {
      discountAmount = (baseTotal * listing.weeklyDiscount) / 100;
      baseTotal     -= discountAmount;
    }

    const totalCost = Math.round(
      (baseTotal +
        (listing.cleaningFee    || 0) +
        (listing.serviceFee     || 0) +
        (listing.occupancyTaxes || 0)) * 100
    ) / 100;

    // ── Create reservation ────────────────────────────────────────────────────
    const reservationData = {
      accommodation  : listing._id,
      user           : req.user._id,
      checkIn        : checkInDate,
      checkOut       : checkOutDate,
      guests         : guestNum,
      nights,
      pricePerNight  : listing.price,
      weeklyDiscount : discountAmount,
      cleaningFee    : listing.cleaningFee    || 0,
      serviceFee     : listing.serviceFee     || 0,
      occupancyTaxes : listing.occupancyTaxes || 0,
      totalCost,
      listingTitle   : listing.title,
      listingLocation: listing.location,
      listingImage   : listing.images && listing.images[0] ? listing.images[0] : '',
    };

    // Only set host_id if the listing actually has one (seeded listings may not)
    if (listing.host_id) {
      reservationData.host_id = listing.host_id;
    }

    const reservation = await Reservation.create(reservationData);

    return res.status(201).json({ message: 'Reservation created successfully', reservation });

  } catch (err) {
    // Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid accommodation ID format' });
    }
    console.error('Reservation create error:', err);
    return res.status(500).json({ message: 'Error creating reservation', error: err.message });
  }
};

// ─── GET /api/reservations/host ───────────────────────────────────────────────
const getReservationsByHost = async (req, res) => {
  try {
    const reservations = await Reservation.find({ host_id: req.user._id })
      .populate('accommodation', 'title location images price')
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    return res.status(200).json(reservations);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching host reservations', error: err.message });
  }
};

// ─── GET /api/reservations/user ───────────────────────────────────────────────
const getReservationsByUser = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('accommodation', 'title location images price rating')
      .sort({ createdAt: -1 });

    return res.status(200).json(reservations);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching user reservations', error: err.message });
  }
};

// ─── GET /api/reservations ────────────────────────────────────────────────────
const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({})
      .populate('accommodation', 'title location images price')
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    return res.status(200).json(reservations);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching reservations', error: err.message });
  }
};

// ─── DELETE /api/reservations/:id ─────────────────────────────────────────────
const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const isOwner = reservation.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to cancel this reservation' });
    }

    await reservation.deleteOne();
    return res.status(200).json({ message: 'Reservation cancelled successfully' });

  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid reservation ID' });
    }
    return res.status(500).json({ message: 'Error deleting reservation', error: err.message });
  }
};

module.exports = {
  createReservation,
  getReservationsByHost,
  getReservationsByUser,
  getAllReservations,
  deleteReservation,
};
