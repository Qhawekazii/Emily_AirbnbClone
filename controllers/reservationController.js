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
 * Requires authentication.
 * Body: { accommodation, checkIn, checkOut, guests }
 */
const createReservation = async (req, res) => {
  try {
    const { accommodation: accommodationId, checkIn, checkOut, guests } = req.body;

    if (!accommodationId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({
        message: 'Accommodation ID, check-in, check-out, and guests are required',
      });
    }

    // Fetch listing to snapshot pricing
    const listing = await Accommodation.findById(accommodationId);
    if (!listing) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    // Calculate nights
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    // Validate guest count
    if (Number(guests) > listing.guests) {
      return res.status(400).json({
        message: `This listing allows a maximum of ${listing.guests} guests`,
      });
    }

    // Calculate total cost with weekly discount
    let baseTotal = listing.price * nights;
    let discountAmount = 0;

    if (nights >= 7 && listing.weeklyDiscount > 0) {
      discountAmount = (baseTotal * listing.weeklyDiscount) / 100;
      baseTotal -= discountAmount;
    }

    const totalCost =
      baseTotal +
      (listing.cleaningFee || 0) +
      (listing.serviceFee || 0) +
      (listing.occupancyTaxes || 0);

    const reservation = await Reservation.create({
      accommodation: listing._id,
      user: req.user._id,
      host_id: listing.host_id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: Number(guests),
      nights,
      pricePerNight: listing.price,
      weeklyDiscount: discountAmount,
      cleaningFee: listing.cleaningFee || 0,
      serviceFee: listing.serviceFee || 0,
      occupancyTaxes: listing.occupancyTaxes || 0,
      totalCost: Math.round(totalCost * 100) / 100,
      listingTitle: listing.title,
      listingLocation: listing.location,
      listingImage: listing.images[0] || '',
    });

    res.status(201).json({ message: 'Reservation created successfully', reservation });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Error creating reservation', error: err.message });
  }
};

// ─── GET /api/reservations/host ───────────────────────────────────────────────
/**
 * Get all reservations for listings owned by the authenticated host.
 * Requires authentication (host or admin role).
 */
const getReservationsByHost = async (req, res) => {
  try {
    const reservations = await Reservation.find({ host_id: req.user._id })
      .populate('accommodation', 'title location images price')
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json(reservations);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching host reservations', error: err.message });
  }
};

// ─── GET /api/reservations/user ───────────────────────────────────────────────
/**
 * Get all reservations made by the authenticated user.
 * Requires authentication.
 */
const getReservationsByUser = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('accommodation', 'title location images price rating')
      .sort({ createdAt: -1 });

    res.status(200).json(reservations);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user reservations', error: err.message });
  }
};

// ─── GET /api/reservations ────────────────────────────────────────────────────
/**
 * Get all reservations (admin only).
 */
const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({})
      .populate('accommodation', 'title location images price')
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json(reservations);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reservations', error: err.message });
  }
};

// ─── DELETE /api/reservations/:id ────────────────────────────────────────────
/**
 * Cancel/delete a reservation by ID.
 * Only the guest who made the reservation or an admin can delete it.
 * Requires authentication.
 */
const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Allow only the guest or admin to delete
    const isOwner = reservation.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to cancel this reservation' });
    }

    await reservation.deleteOne();

    res.status(200).json({ message: 'Reservation cancelled successfully' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid reservation ID' });
    }
    res.status(500).json({ message: 'Error deleting reservation', error: err.message });
  }
};

module.exports = {
  createReservation,
  getReservationsByHost,
  getReservationsByUser,
  getAllReservations,
  deleteReservation,
};
