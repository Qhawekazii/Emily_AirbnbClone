/**
 * middleware/errorHandler.js
 * Centralised error handling middleware.
 * Must be registered LAST in Express (after all routes).
 */

/**
 * notFound - catches any route that didn't match and passes a 404 error.
 */
const notFound = (req, res, next) => {
  const err = new Error(`Not Found — ${req.originalUrl}`);
  err.status = 404;
  next(err);
};

/**
 * errorHandler - formats and returns JSON error responses.
 * Strips stack traces in production.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || (res.statusCode === 200 ? 500 : res.statusCode);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
