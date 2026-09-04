/**
 * models/Reservation.js
 * Mongoose schema for accommodation reservations.
 * Links guests (users) to accommodations with date ranges and cost breakdown.
 */

const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    accommodation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Accommodation',
      required: [true, 'Accommodation reference is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    // Stored so reservation stays accurate even if listing changes
    host_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    checkIn: {
      type: Date,
      required: [true, 'Check-in date is required'],
    },
    checkOut: {
      type: Date,
      required: [true, 'Check-out date is required'],
    },
    guests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'At least 1 guest required'],
    },
    nights: {
      type: Number,
      required: true,
      min: 1,
    },
    // Pricing snapshot at time of booking
    pricePerNight: { type: Number, required: true },
    weeklyDiscount: { type: Number, default: 0 },
    cleaningFee: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    occupancyTaxes: { type: Number, default: 0 },
    totalCost: { type: Number, required: true },
    // Reservation status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'confirmed',
    },
    // Snapshot of listing details for the reservation record
    listingTitle: { type: String },
    listingLocation: { type: String },
    listingImage: { type: String },
  },
  { timestamps: true }
);

// Validate check-out is after check-in
reservationSchema.pre('save', function () {
  if (this.checkOut <= this.checkIn) {
    throw new Error('Check-out date must be after check-in date');
  }
});

module.exports = mongoose.model('Reservation', reservationSchema);
