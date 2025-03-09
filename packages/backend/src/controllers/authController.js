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
    // Get base URL for redirect
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectTo = `${baseUrl}/auth/callback`;
    
    console.log('Generating Twitter auth with redirect to:', redirectTo);
    
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
 * Get authentication URL for Twitch OAuth
 */
exports.getTwitchAuthUrl = async (req, res) => {
  try {
    // Get base URL for redirect
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectTo = `${baseUrl}/auth/callback`;
    
    console.log('Generating Twitch auth with redirect to:', redirectTo);
    
    // Generate Twitch OAuth URL via Supabase
    const { data, error } = await supabaseAdmin.auth.signInWithOAuth({
      provider: 'twitch',
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
    console.error('Twitch auth URL error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error generating Twitch auth URL' 
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



// Import the utility function
const { ensureUserProfile } = require('../utils/profileHelpers');

/**
 * Handle OAuth callback
 */
exports.handleAuthCallback = async (req, res) => {
  try {
    const { params } = req.body;
    
    // Exchange OAuth token using Supabase
    const { data, error } = await supabaseAdmin.auth.exchangeCodeForSession(params.code);
    
    if (error) {
      return res.status(400).json({ 
        error: true, 
        message: error.message 
      });
    }
    
    // Get user from Supabase
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(data.user.id);
    
    if (userError) {
      return res.status(400).json({ 
        error: true, 
        message: 'Failed to retrieve user data' 
      });
    }
    
    // Create or get existing profile
    try {
      await ensureUserProfile(userData.user);
    } catch (profileError) {
      console.error('Failed to create user profile:', profileError);
      // Continue with auth flow even if profile creation fails
      // We'll at least let them log in
    }
    
    res.status(200).json({
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
    console.error('Auth callback error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error processing authentication callback' 
    });
  }
};


/**
 * Validate and create session based on OAuth response
 */
exports.validateSession = async (req, res) => {
  try {
    const { queryParams, hashParams } = req.body;
    
    // Reconstruct the full URL that Supabase expects
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const fullUrl = `${baseUrl}/auth/callback${queryParams}${hashParams}`;
    
    console.log('Processing auth callback with URL:', fullUrl);
    
    // Use the more reliable setSession method which handles both code exchanges and hash params
    const { data, error } = await supabaseAdmin.auth.getSessionFromUrl({
      url: fullUrl,
      // This should match the callback URL you configured in Supabase
      options: {
        redirectTo: `${baseUrl}/auth/callback`
      }
    });
    
    if (error) {
      console.error('Session validation error:', error);
      return res.status(400).json({ 
        error: true, 
        message: error.message 
      });
    }
    
    // Double-check we got a session
    if (!data || !data.session) {
      return res.status(400).json({ 
        error: true, 
        message: 'No session data returned from authentication provider' 
      });
    }
    
    // Make sure the user has a profile
    if (data.user) {
      try {
        // Get the complete user data with identities
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(data.user.id);
        
        // Check if profile exists
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();
        
        // Create profile if it doesn't exist
        if (!profile && userData.user) {
          // Extract name from identities
          let name = '';
          let email = userData.user.email || '';
          let avatarUrl = '';
          
          if (userData.user.identities && userData.user.identities.length > 0) {
            const identity = userData.user.identities.find(id => id.provider === 'twitter');
            if (identity && identity.identity_data) {
              name = identity.identity_data.full_name || identity.identity_data.name || '';
              if (identity.identity_data.avatar_url) {
                avatarUrl = identity.identity_data.avatar_url;
              }
            }
            
            // Check for Twitch identity
            const twitchIdentity = userData.user.identities.find(id => id.provider === 'twitch');
            if (twitchIdentity && twitchIdentity.identity_data) {
              // Use Twitch data if Twitter data isn't available or if this is a Twitch login
              if (!name || name === '') {
                name = twitchIdentity.identity_data.preferred_username || 
                       twitchIdentity.identity_data.nickname ||
                       twitchIdentity.identity_data.display_name ||
                       twitchIdentity.identity_data.name || '';
                       
                // Log the identity data to debug
                console.log('Twitch identity data:', JSON.stringify(twitchIdentity.identity_data, null, 2));
                
                // Fallback to global metadata if identity data doesn't have name
                if ((!name || name === '') && userData.user.user_metadata && userData.user.user_metadata.full_name) {
                  name = userData.user.user_metadata.full_name;
                }
              }
              
              if (!avatarUrl) {
                avatarUrl = twitchIdentity.identity_data.picture || 
                            twitchIdentity.identity_data.avatar_url || '';
              }
              
              if (!email && twitchIdentity.identity_data.email) {
                email = twitchIdentity.identity_data.email;
              }
            }
          }
          
          console.log('Creating profile for user:', userData.user.id, name);
          
          // Create profile
          await supabaseAdmin
            .from('profiles')
            .insert({
              id: userData.user.id,
              email: email,
              name: name,
              bio: '',
              avatar_url: avatarUrl
            });
        }
      } catch (profileError) {
        console.error('Profile creation error:', profileError);
        // Continue with auth flow even if profile fails
      }
    }
    
    res.status(200).json({
      user: data.user,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      }
    });
  } catch (err) {
    console.error('Session validation error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error validating session' 
    });
  }
};


/**
 * Verify tokens and return user data
 */
exports.verifyTokens = async (req, res) => {
  try {
    const { access_token } = req.body;
    
    if (!access_token) {
      return res.status(400).json({
        error: true,
        message: 'Access token is required'
      });
    }
    
    // Get user info using the token
    const { data, error } = await supabaseAdmin.auth.getUser(access_token);
    
    if (error) {
      return res.status(401).json({
        error: true,
        message: 'Invalid token'
      });
    }
    
    // Ensure the user has a profile
    let profile;
    try {
      profile = await ensureUserProfile(data.user);
      console.log('Profile after ensure:', profile);
    } catch (profileError) {
      console.error('Error ensuring user profile:', profileError);
      // Continue even if profile creation fails
    }
    
    // Get the latest profile data (in case ensureUserProfile just created it)
    const { data: latestProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError) {
      console.error('Error getting profile:', profileError);
    }
    
    const userResponse = {
      id: data.user.id,
      email: data.user.email,
      name: latestProfile?.name || data.user.user_metadata?.full_name || data.user.user_metadata?.name || ''
    };
    
    console.log('Returning user data:', userResponse);
    
    res.status(200).json({
      user: userResponse
    });
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(500).json({
      error: true,
      message: 'Error verifying token'
    });
  }
};