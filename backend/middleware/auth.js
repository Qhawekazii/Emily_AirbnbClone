/**
 * middleware/auth.js
 * JWT authentication middleware.
 * Protects routes by verifying the Bearer token in the Authorization header.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect - Verifies JWT and attaches the authenticated user to req.user.
 * Usage: router.get('/protected', protect, handler)
 */
const protect = async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized — no token provided' });
  }

  try {
    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (exclude password)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized — user no longer exists' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized — invalid token' });
  }
};

/**
 * adminOnly - Restricts route to admin-role users.
 * Must be used after protect middleware.
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden — admin access required' });
};

/**
 * hostOrAdmin - Restricts route to host or admin-role users.
 * Must be used after protect middleware.
 */
const hostOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'host' || req.user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden — host or admin access required' });
};

module.exports = { protect, adminOnly, hostOrAdmin };
