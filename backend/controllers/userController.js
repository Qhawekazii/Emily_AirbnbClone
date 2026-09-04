/**
 * controllers/userController.js
 * Handles user registration, login, and profile retrieval.
 * Passwords are hashed by the User model's pre-save hook.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate a signed JWT for a user.
 * @param {string} id - MongoDB user ID
 * @returns {string} JWT token (expires in 7 days)
 */
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ─── POST /api/users/register ─────────────────────────────────────────────────
/**
 * Register a new user.
 * Body: { username, email, password, role? }
 */
const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    // Check for existing user
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'A user with that email already exists' });
    }

    // Create user (password hashed by pre-save hook)
    const user = await User.create({ username, email, password, role });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } catch (err) {
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error during registration', error: err.message });
  }
};

// ─── POST /api/users/login ────────────────────────────────────────────────────
/**
 * Log in an existing user.
 * Body: { email, password }
 * Returns: user object + JWT token
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user and verify password — use .select('+password') since field has select:false
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
};

// ─── GET /api/users/profile ───────────────────────────────────────────────────
/**
 * Get the authenticated user's profile.
 * Requires: Bearer token
 */
const getUserProfile = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching profile', error: err.message });
  }
};

// ─── GET /api/users ───────────────────────────────────────────────────────────
/**
 * Get all users (admin only).
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching users', error: err.message });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, getAllUsers };
