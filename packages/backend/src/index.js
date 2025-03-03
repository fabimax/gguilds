/**
 * Main entry point for the GoodGuilds API server
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(helmet()); // Security headers
app.use(express.json()); // Parse JSON request bodies
app.use(morgan('dev')); // HTTP request logging

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'GoodGuilds API is running' });
});

// Import and use route modules
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/guilds', require('./routes/guilds'));
app.use('/api/badges', require('./routes/badges'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`GoodGuilds API server running on port ${PORT}`);
});

module.exports = app; // Export for testing