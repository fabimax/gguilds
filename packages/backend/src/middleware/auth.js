/**
 * Authentication middleware for GoodGuilds API
 * 
 * Verifies JWT tokens from Supabase Auth
 */
const { supabaseAdmin } = require('../utils/supabase');

/**
 * Middleware to verify authentication token and attach user to request
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: true, 
        message: 'Authentication required' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ 
        error: true, 
        message: 'Invalid or expired token' 
      });
    }
    
    // Attach user to request object
    req.user = data.user;
    
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(401).json({ 
      error: true, 
      message: 'Authentication error' 
    });
  }
};

/**
 * Middleware that supports authentication but doesn't require it
 * Useful for endpoints that change behavior based on authentication status
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    // If no auth header, proceed without authentication
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    
    // Even if there's an error, we still proceed, just without setting req.user
    if (!error && data.user) {
      // Attach user to request object
      req.user = data.user;
    }
    
    next();
  } catch (err) {
    // Even if there's an error, we still proceed without authentication
    next();
  }
};