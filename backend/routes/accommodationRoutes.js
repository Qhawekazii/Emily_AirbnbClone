/**
 * routes/accommodationRoutes.js
 * CRUD routes for accommodation listings.
 * Read operations are public; write operations require authentication.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getAllAccommodations,
  getAccommodationById,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
} = require('../controllers/accommodationController');
const { protect } = require('../middleware/auth');

// ─── Multer Storage Config ────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `listing-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const isValid =
    allowedTypes.test(path.extname(file.originalname).toLowerCase()) &&
    allowedTypes.test(file.mimetype);
  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, webp, gif)'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// Public
router.get('/', getAllAccommodations);           // GET  /api/accommodations
router.get('/:id', getAccommodationById);        // GET  /api/accommodations/:id

// Protected (require login)
router.post(
  '/',
  protect,
  upload.array('images', 10),
  createAccommodation
); // POST /api/accommodations

router.put(
  '/:id',
  protect,
  upload.array('images', 10),
  updateAccommodation
); // PUT  /api/accommodations/:id

router.delete('/:id', protect, deleteAccommodation); // DELETE /api/accommodations/:id

module.exports = router;
