/**
 * controllers/accommodationController.js
 * Full CRUD for accommodation listings.
 * Create/Update/Delete require authentication; Read is public.
 */

const Accommodation = require('../models/Accommodation');
const path = require('path');
const fs = require('fs');

// ─── GET /api/accommodations ──────────────────────────────────────────────────
/**
 * Get all accommodation listings.
 * Supports optional query params:
 *   ?location=Paris  — filter by city (case-insensitive)
 *   ?type=Villa      — filter by accommodation type
 *   ?minPrice=100    — minimum price per night
 *   ?maxPrice=500    — maximum price per night
 *   ?page=1          — page number (default 1)
 *   ?limit=10        — results per page (default 20, max 50)
 */
const getAllAccommodations = async (req, res) => {
  try {
    const filter = {};
    const { location, type, minPrice, maxPrice, page = 1, limit = 20 } = req.query;

    if (location) filter.location = { $regex: location, $options: 'i' };
    if (type) filter.type = type;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [accommodations, total] = await Promise.all([
      Accommodation.find(filter)
        .populate('host_id', 'username email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Accommodation.countDocuments(filter),
    ]);

    res.status(200).json({
      accommodations,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching accommodations', error: err.message });
  }
};

// ─── GET /api/accommodations/:id ──────────────────────────────────────────────
/**
 * Get a single accommodation by ID.
 */
const getAccommodationById = async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id).populate(
      'host_id',
      'username email'
    );

    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    res.status(200).json(accommodation);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid accommodation ID' });
    }
    res.status(500).json({ message: 'Error fetching accommodation', error: err.message });
  }
};

// ─── POST /api/accommodations ─────────────────────────────────────────────────
/**
 * Create a new accommodation listing.
 * Requires authentication. Supports optional image upload via multer.
 * Body: all Accommodation fields
 */
const createAccommodation = async (req, res) => {
  try {
    const {
      title, location, description, type, price,
      guests, bedrooms, bathrooms, amenities,
      weeklyDiscount, cleaningFee, serviceFee, occupancyTaxes,
      host, rating, reviews, enhancedCleaning, selfCheckIn,
    } = req.body;

    // Validate required fields
    if (!title || !location || !description || !type || !price) {
      return res.status(400).json({
        message: 'Title, location, description, type, and price are required',
      });
    }

    // Handle uploaded images or image URLs from body
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (req.body.images) {
      // Accept JSON array string or comma-separated string
      images = Array.isArray(req.body.images)
        ? req.body.images
        : req.body.images.split(',').map((s) => s.trim());
    }

    // Parse amenities (may arrive as JSON string or array)
    let parsedAmenities = [];
    if (amenities) {
      parsedAmenities = Array.isArray(amenities)
        ? amenities
        : amenities.split(',').map((s) => s.trim());
    }

    const accommodation = await Accommodation.create({
      title,
      location,
      description,
      type,
      price: Number(price),
      guests: Number(guests) || 1,
      bedrooms: Number(bedrooms) || 0,
      bathrooms: Number(bathrooms) || 0,
      amenities: parsedAmenities,
      images,
      weeklyDiscount: Number(weeklyDiscount) || 0,
      cleaningFee: Number(cleaningFee) || 0,
      serviceFee: Number(serviceFee) || 0,
      occupancyTaxes: Number(occupancyTaxes) || 0,
      host: host || req.user.username,
      host_id: req.user._id,
      rating: Number(rating) || 0,
      reviews: Number(reviews) || 0,
      enhancedCleaning: enhancedCleaning === 'true' || enhancedCleaning === true,
      selfCheckIn: selfCheckIn === 'true' || selfCheckIn === true,
    });

    res.status(201).json({ message: 'Accommodation created successfully', accommodation });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Error creating accommodation', error: err.message });
  }
};

// ─── PUT /api/accommodations/:id ──────────────────────────────────────────────
/**
 * Update an existing accommodation listing.
 * Requires authentication.
 */
const updateAccommodation = async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);

    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    // Handle new uploaded images
    let images = accommodation.images;
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (req.body.images) {
      images = Array.isArray(req.body.images)
        ? req.body.images
        : req.body.images.split(',').map((s) => s.trim());
    }

    // Parse amenities
    let amenities = accommodation.amenities;
    if (req.body.amenities) {
      amenities = Array.isArray(req.body.amenities)
        ? req.body.amenities
        : req.body.amenities.split(',').map((s) => s.trim());
    }

    // Build update object from provided fields
    const updates = {
      title: req.body.title ?? accommodation.title,
      location: req.body.location ?? accommodation.location,
      description: req.body.description ?? accommodation.description,
      type: req.body.type ?? accommodation.type,
      price: req.body.price ? Number(req.body.price) : accommodation.price,
      guests: req.body.guests ? Number(req.body.guests) : accommodation.guests,
      bedrooms: req.body.bedrooms !== undefined ? Number(req.body.bedrooms) : accommodation.bedrooms,
      bathrooms: req.body.bathrooms !== undefined ? Number(req.body.bathrooms) : accommodation.bathrooms,
      amenities,
      images,
      weeklyDiscount: req.body.weeklyDiscount !== undefined ? Number(req.body.weeklyDiscount) : accommodation.weeklyDiscount,
      cleaningFee: req.body.cleaningFee !== undefined ? Number(req.body.cleaningFee) : accommodation.cleaningFee,
      serviceFee: req.body.serviceFee !== undefined ? Number(req.body.serviceFee) : accommodation.serviceFee,
      occupancyTaxes: req.body.occupancyTaxes !== undefined ? Number(req.body.occupancyTaxes) : accommodation.occupancyTaxes,
      host: req.body.host ?? accommodation.host,
      enhancedCleaning: req.body.enhancedCleaning !== undefined
        ? req.body.enhancedCleaning === 'true' || req.body.enhancedCleaning === true
        : accommodation.enhancedCleaning,
      selfCheckIn: req.body.selfCheckIn !== undefined
        ? req.body.selfCheckIn === 'true' || req.body.selfCheckIn === true
        : accommodation.selfCheckIn,
    };

    const updated = await Accommodation.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: 'Accommodation updated successfully', accommodation: updated });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid accommodation ID' });
    }
    res.status(500).json({ message: 'Error updating accommodation', error: err.message });
  }
};

// ─── DELETE /api/accommodations/:id ──────────────────────────────────────────
/**
 * Delete an accommodation listing by ID.
 * Requires authentication.
 */
const deleteAccommodation = async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);

    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    // Remove locally stored images
    accommodation.images.forEach((imgPath) => {
      if (imgPath.startsWith('/uploads/')) {
        const fullPath = path.join(__dirname, '..', imgPath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    });

    await accommodation.deleteOne();

    res.status(200).json({ message: 'Accommodation deleted successfully' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid accommodation ID' });
    }
    res.status(500).json({ message: 'Error deleting accommodation', error: err.message });
  }
};

module.exports = {
  getAllAccommodations,
  getAccommodationById,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
};
