/**
 * server.js
 * Entry point — connects to MongoDB and starts the HTTP server.
 * The Express app itself lives in app.js so tests can import it independently.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config();

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
