// packages/backend/src/utils/profileHelpers.js
const { supabaseAdmin } = require('./supabase');

/**
 * Creates a user profile if it doesn't exist
 * Works for all auth methods including social logins
 * @param {Object} user - The user object from Supabase Auth
 * @returns {Promise<Object>} - The created or existing profile
 */
exports.ensureUserProfile = async (user) => {
  if (!user || !user.id) {
    throw new Error('Invalid user object');
  }
  
  // Check if profile already exists
  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
    
  if (existingProfile) {
    return existingProfile;
  }
  
  // Extract user information based on auth provider
  let name = '';
  let email = user.email || '';
  let avatarUrl = '';
  
  // Handle social identities with provider-specific logic
  if (user.identities && user.identities.length > 0) {
    // Find the primary identity (usually the first one)
    const identity = user.identities[0];
    const identityData = identity.identity_data || {};
    
    // Twitter-specific profile data
    if (identity.provider === 'twitter') {
      name = identityData.full_name || identityData.name || '';
      // Twitter username as fallback if no full name
      if (!name && identityData.user_name) {
        name = identityData.user_name;
      }
      
      // Twitter profile picture
      if (identityData.avatar_url) {
        avatarUrl = identityData.avatar_url;
      }
      
      // Some Twitter users might not share email
      if (!email && identityData.email) {
        email = identityData.email;
      }
    }
    
    // Add similar blocks for other providers if needed
  }
  
  // Create profile record
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: user.id,
      email: email,
      name: name,
      bio: '',
      avatar_url: avatarUrl
    })
    .select()
    .single();
    
  if (error) {
    console.error('Profile creation error:', error);
    throw error;
  }
  
  return profile;
};