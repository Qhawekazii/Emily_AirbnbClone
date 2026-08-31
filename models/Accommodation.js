/**
 * models/Accommodation.js
 * Mongoose schema for property listings.
 * Matches the recommended data structure from the project brief.
 */

const mongoose = require('mongoose');

const specificRatingsSchema = new mongoose.Schema(
  {
    cleanliness: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    checkIn: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    location: { type: Number, default: 0 },
    value: { type: Number, default: 0 },
  },
  { _id: false }
);

const accommodationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    type: {
      type: String,
      required: [true, 'Accommodation type is required'],
      enum: [
        'Entire apartment',
        'Entire house',
        'Private room',
        'Shared room',
        'Villa',
        'Cabin',
        'Beach house',
        'Cottage',
      ],
    },
    price: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: [1, 'Price must be positive'],
    },
    guests: {
      type: Number,
      required: [true, 'Guest count is required'],
      min: 1,
    },
    bedrooms: {
      type: Number,
      required: [true, 'Bedroom count is required'],
      min: 0,
    },
    bathrooms: {
      type: Number,
      required: [true, 'Bathroom count is required'],
      min: 0,
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    // Pricing breakdown
    weeklyDiscount: { type: Number, default: 0 },
    cleaningFee: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    occupancyTaxes: { type: Number, default: 0 },
    // Host info
    host: { type: String, default: 'Airbnb Host' },
    host_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Ratings
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0 },
    specificRatings: { type: specificRatingsSchema, default: () => ({}) },
    // Features
    enhancedCleaning: { type: Boolean, default: false },
    selfCheckIn: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Accommodation', accommodationSchema);
