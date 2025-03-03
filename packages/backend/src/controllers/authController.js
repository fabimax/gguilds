/**
 * Authentication controller for handling user signup, login, and social auth
 */
const { supabaseAdmin } = require('../utils/supabase');

/**
 * Register a new user with email and password
 */
exports.signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: true, 
        message: 'Email and password are required' 
      });
    }
    
    // Create user with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true //!!comment this out to prevent auto email confirmation
    });
    
    if (error) {
      console.error('Signup error:', error);
      return res.status(400).json({ 
        error: true, 
        message: error.message 
      });
    }
    
    // Set up user profile in our database
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: data.user.id,
        email: data.user.email,
        name: name || '',
        bio: '',
        avatar_url: ''
      });
      
    if (profileError) {
      console.error('Profile creation error:', profileError);
      // We could handle this better, but for now just return success as the auth account was created
    }
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        name: name || ''
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error creating user' 
    });
  }
};

/**
 * Login with email and password
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: true, 
        message: 'Email and password are required' 
      });
    }
    
    // Sign in with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return res.status(401).json({ 
        error: true, 
        message: 'Invalid credentials' 
      });
    }
    
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error logging in' 
    });
  }
};

/**
 * Get authentication URL for Twitter/X OAuth
 */
exports.getTwitterAuthUrl = async (req, res) => {
  try {
    // Get the redirect URL from query params or use a default
    const redirectTo = req.query.redirectTo || process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Generate Twitter OAuth URL via Supabase
    const { data, error } = await supabaseAdmin.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo
      }
    });
    
    if (error) {
      return res.status(400).json({ 
        error: true, 
        message: error.message 
      });
    }
    
    res.status(200).json({
      url: data.url
    });
  } catch (err) {
    console.error('Twitter auth URL error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error generating Twitter auth URL' 
    });
  }
};

/**
 * Validate and refresh session token
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({ 
        error: true, 
        message: 'Refresh token is required' 
      });
    }
    
    // Refresh session with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token
    });
    
    if (error) {
      return res.status(401).json({ 
        error: true, 
        message: 'Invalid or expired refresh token' 
      });
    }
    
    res.status(200).json({
      message: 'Token refreshed successfully',
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      }
    });
  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error refreshing token' 
    });
  }
};

/**
 * Logout user by invalidating session
 */
exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(400).json({ 
        error: true, 
        message: 'Authorization header is required' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Set up the client with the user's token
    const { error } = await supabaseAdmin.auth.admin.signOut({
      token
    });
    
    if (error) {
      return res.status(400).json({ 
        error: true, 
        message: error.message 
      });
    }
    
    res.status(200).json({
      message: 'Logged out successfully'
    });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error logging out' 
    });
  }
};