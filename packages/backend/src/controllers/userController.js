/**
 * User profile controller for GoodGuilds API
 */
const { supabaseAdmin } = require('../utils/supabase');

/**
 * Get current user profile
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get profile data from the profiles table
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      return res.status(404).json({ 
        error: true, 
        message: 'User profile not found' 
      });
    }
    
    // Get guild memberships
    const { data: memberships, error: membershipError } = await supabaseAdmin
      .from('guild_members')
      .select(`
        role,
        guilds (
          id,
          name,
          icon_url
        )
      `)
      .eq('user_id', userId);
      
    if (membershipError) {
      console.error('Error fetching guild memberships:', membershipError);
    }
    
    // Get user badges
    const { data: badges, error: badgesError } = await supabaseAdmin
      .from('user_badges')
      .select(`
        badges (
          id,
          name,
          description,
          icon_url
        )
      `)
      .eq('user_id', userId);
      
    if (badgesError) {
      console.error('Error fetching user badges:', badgesError);
    }
    
    // Format guild memberships for response
    const guilds = memberships?.map(membership => ({
      id: membership.guilds.id,
      name: membership.guilds.name,
      icon_url: membership.guilds.icon_url,
      role: membership.role
    })) || [];
    
    // Format badges for response
    const userBadges = badges?.map(badge => ({
      id: badge.badges.id,
      name: badge.badges.name,
      description: badge.badges.description,
      icon_url: badge.badges.icon_url
    })) || [];
    
    res.status(200).json({
      profile: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at
      },
      guilds,
      badges: userBadges
    });
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error fetching user profile' 
    });
  }
};

/**
 * Get user profile by ID
 */
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get profile data from the profiles table
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id, name, bio, avatar_url, created_at')
      .eq('id', userId)
      .single();
    
    if (error) {
      return res.status(404).json({ 
        error: true, 
        message: 'User profile not found' 
      });
    }
    
    // Get guild memberships
    const { data: memberships, error: membershipError } = await supabaseAdmin
      .from('guild_members')
      .select(`
        role,
        guilds (
          id,
          name,
          icon_url
        )
      `)
      .eq('user_id', userId);
      
    if (membershipError) {
      console.error('Error fetching guild memberships:', membershipError);
    }
    
    // Get user badges
    const { data: badges, error: badgesError } = await supabaseAdmin
      .from('user_badges')
      .select(`
        badges (
          id,
          name,
          description,
          icon_url
        )
      `)
      .eq('user_id', userId);
      
    if (badgesError) {
      console.error('Error fetching user badges:', badgesError);
    }
    
    // Format guild memberships for response
    const guilds = memberships?.map(membership => ({
      id: membership.guilds.id,
      name: membership.guilds.name,
      icon_url: membership.guilds.icon_url,
      role: membership.role
    })) || [];
    
    // Format badges for response
    const userBadges = badges?.map(badge => ({
      id: badge.badges.id,
      name: badge.badges.name,
      description: badge.badges.description,
      icon_url: badge.badges.icon_url
    })) || [];
    
    res.status(200).json({
      profile,
      guilds,
      badges: userBadges
    });
  } catch (err) {
    console.error('Get user by ID error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error fetching user profile' 
    });
  }
};

/**
 * Update current user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, bio, avatar_url } = req.body;
    
    // Update profile in Supabase
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        name: name || undefined,
        bio: bio || undefined,
        avatar_url: avatar_url || undefined,
        updated_at: new Date()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ 
        error: true, 
        message: error.message 
      });
    }
    
    res.status(200).json({
      message: 'Profile updated successfully',
      profile: {
        id: data.id,
        email: data.email,
        name: data.name,
        bio: data.bio,
        avatar_url: data.avatar_url,
        updated_at: data.updated_at
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error updating profile' 
    });
  }
};