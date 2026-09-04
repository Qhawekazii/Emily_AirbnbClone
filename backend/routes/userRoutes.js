/**
 * routes/userRoutes.js
 * User authentication and profile routes.
 */

const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.post('/register', registerUser);   // POST /api/users/register
router.post('/login', loginUser);         // POST /api/users/login

// Protected routes
router.get('/profile', protect, getUserProfile);          // GET /api/users/profile
router.get('/', protect, adminOnly, getAllUsers);          // GET /api/users (admin only)

module.exports = router;
