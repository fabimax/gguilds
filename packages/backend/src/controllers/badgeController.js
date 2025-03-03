/**
 * Badge controller for GoodGuilds API
 * Handles badge creation, assignment, and management
 */
const { supabaseAdmin } = require('../utils/supabase');

/**
 * Create a new badge
 */
exports.createBadge = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, icon_url } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ 
        error: true, 
        message: 'Badge name is required' 
      });
    }
    
    // Create badge in the database
    const { data: badge, error } = await supabaseAdmin
      .from('badges')
      .insert({
        name,
        description,
        icon_url,
        created_by: userId
      })
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ 
        error: true, 
        message: error.message 
      });
    }
    
    res.status(201).json({
      message: 'Badge created successfully',
      badge
    });
  } catch (err) {
    console.error('Create badge error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error creating badge' 
    });
  }
};

/**
 * Get all badges created by the current user
 */
exports.getUserBadges = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get badges created by the user
    const { data: badges, error } = await supabaseAdmin
      .from('badges')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      return res.status(400).json({ 
        error: true, 
        message: error.message 
      });
    }
    
    res.status(200).json({
      badges
    });
  } catch (err) {
    console.error('Get user badges error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error fetching badges' 
    });
  }
};

/**
 * Get badge by ID
 */
exports.getBadgeById = async (req, res) => {
  try {
    const { badgeId } = req.params;
    
    // Get badge data
    const { data: badge, error } = await supabaseAdmin
      .from('badges')
      .select(`
        *,
        profiles:created_by (
          id,
          name,
          avatar_url
        )
      `)
      .eq('id', badgeId)
      .single();
    
    if (error) {
      return res.status(404).json({ 
        error: true, 
        message: 'Badge not found' 
      });
    }
    
    // Format creator data
    const formattedBadge = {
      ...badge,
      creator: badge.profiles ? {
        id: badge.profiles.id,
        name: badge.profiles.name,
        avatar_url: badge.profiles.avatar_url
      } : null
    };
    delete formattedBadge.profiles;
    
    res.status(200).json({
      badge: formattedBadge
    });
  } catch (err) {
    console.error('Get badge by ID error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error fetching badge' 
    });
  }
};

/**
 * Update badge
 */
exports.updateBadge = async (req, res) => {
  try {
    const { badgeId } = req.params;
    const userId = req.user.id;
    const { name, description, icon_url } = req.body;
    
    // Check if user is the creator of the badge
    const { data: badge, error: badgeError } = await supabaseAdmin
      .from('badges')
      .select('created_by')
      .eq('id', badgeId)
      .single();
    
    if (badgeError) {
      return res.status(404).json({ 
        error: true, 
        message: 'Badge not found' 
      });
    }
    
    if (badge.created_by !== userId) {
      return res.status(403).json({ 
        error: true, 
        message: 'You can only update badges you created' 
      });
    }
    
    // Update the badge
    const { data: updatedBadge, error } = await supabaseAdmin
      .from('badges')
      .update({
        name: name || undefined,
        description: description || undefined,
        icon_url: icon_url || undefined,
        updated_at: new Date()
      })
      .eq('id', badgeId)
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ 
        error: true, 
        message: error.message 
      });
    }
    
    res.status(200).json({
      message: 'Badge updated successfully',
      badge: updatedBadge
    });
  } catch (err) {
    console.error('Update badge error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error updating badge' 
    });
  }
};

/**
 * Assign badge to a user
 */
exports.assignBadgeToUser = async (req, res) => {
  try {
    const { badgeId } = req.params;
    const assignerId = req.user.id;
    const { userId } = req.body;
    
    // Check if badge exists and user created it
    const { data: badge, error: badgeError } = await supabaseAdmin
      .from('badges')
      .select('created_by')
      .eq('id', badgeId)
      .single();
    
    if (badgeError) {
      return res.status(404).json({ 
        error: true, 
        message: 'Badge not found' 
      });
    }
    
    if (badge.created_by !== assignerId) {
      return res.status(403).json({ 
        error: true, 
        message: 'You can only assign badges you created' 
      });
    }
    
    // Check if user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (userError) {
      return res.status(404).json({ 
        error: true, 
        message: 'User not found' 
      });
    }
    
    // Check if user already has this badge
    const { data: existingBadge, error: existingError } = await supabaseAdmin
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
      .eq('badge_id', badgeId)
      .maybeSingle();
    
    if (existingBadge) {
      return res.status(400).json({ 
        error: true, 
        message: 'User already has this badge' 
      });
    }
    
    // Assign badge to user
    const { error } = await supabaseAdmin
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_id: badgeId,
        assigned_by: assignerId
      });
    
    if (error) {
      return res.status(400).json({ 
        error: true, 
        message: error.message 
      });
    }
    
    res.status(201).json({
      message: 'Badge assigned to user successfully'
    });
  } catch (err) {
    console.error('Assign badge to user error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error assigning badge' 
    });
  }
};

/**
 * Assign badge to a guild
 */
exports.assignBadgeToGuild = async (req, res) => {
  try {
    const { badgeId } = req.params;
    const assignerId = req.user.id;
    const { guildId } = req.body;
    
    // Check if badge exists and user created it
    const { data: badge, error: badgeError } = await supabaseAdmin
      .from('badges')
      .select('created_by')
      .eq('id', badgeId)
      .single();
    
    if (badgeError) {
      return res.status(404).json({ 
        error: true, 
        message: 'Badge not found' 
      });
    }
    
    if (badge.created_by !== assignerId) {
      return res.status(403).json({ 
        error: true, 
        message: 'You can only assign badges you created' 
      });
    }
    
    // Check if guild exists
    const { data: guild, error: guildError } = await supabaseAdmin
      .from('guilds')
      .select('id')
      .eq('id', guildId)
      .single();
    
    if (guildError) {
      return res.status(404).json({ 
        error: true, 
        message: 'Guild not found' 
      });
    }
    
    // Check if guild already has this badge
    const { data: existingBadge, error: existingError } = await supabaseAdmin
      .from('guild_badges')
      .select('*')
      .eq('guild_id', guildId)
      .eq('badge_id', badgeId)
      .maybeSingle();
    
    if (existingBadge) {
      return res.status(400).json({ 
        error: true, 
        message: 'Guild already has this badge' 
      });
    }
    
    // Assign badge to guild
    const { error } = await supabaseAdmin
      .from('guild_badges')
      .insert({
        guild_id: guildId,
        badge_id: badgeId,
        assigned_by: assignerId
      });
    
    if (error) {
      return res.status(400).json({ 
        error: true, 
        message: error.message 
      });
    }
    
    res.status(201).json({
      message: 'Badge assigned to guild successfully'
    });
  } catch (err) {
    console.error('Assign badge to guild error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error assigning badge' 
    });
  }
};

/**
 * Revoke badge from a user
 */
exports.revokeBadgeFromUser = async (req, res) => {
  try {
    const { badgeId, userId } = req.params;
    const revokerId = req.user.id;
    
    // Check if badge exists and user created it
    const { data: badge, error: badgeError } = await supabaseAdmin
      .from('badges')
      .select('created_by')
      .eq('id', badgeId)
      .single();
    
    if (badgeError) {
      return res.status(404).json({ 
        error: true, 
        message: 'Badge not found' 
      });
    }
    
    if (badge.created_by !== revokerId) {
      return res.status(403).json({ 
        error: true, 
        message: 'You can only revoke badges you created' 
      });
    }
    
    // Delete the badge assignment
    const { error } = await supabaseAdmin
      .from('user_badges')
      .delete()
      .eq('user_id', userId)
      .eq('badge_id', badgeId);
    
    if (error) {
      return res.status(400).json({ 
        error: true, 
        message: error.message 
      });
    }
    
    res.status(200).json({
      message: 'Badge revoked from user successfully'
    });
  } catch (err) {
    console.error('Revoke badge from user error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error revoking badge' 
    });
  }
};

/**
 * Revoke badge from a guild
 */
exports.revokeBadgeFromGuild = async (req, res) => {
  try {
    const { badgeId, guildId } = req.params;
    const revokerId = req.user.id;
    
    // Check if badge exists and user created it
    const { data: badge, error: badgeError } = await supabaseAdmin
      .from('badges')
      .select('created_by')
      .eq('id', badgeId)
      .single();
    
    if (badgeError) {
      return res.status(404).json({ 
        error: true, 
        message: 'Badge not found' 
      });
    }
    
    if (badge.created_by !== revokerId) {
      return res.status(403).json({ 
        error: true, 
        message: 'You can only revoke badges you created' 
      });
    }
    
    // Delete the badge assignment
    const { error } = await supabaseAdmin
      .from('guild_badges')
      .delete()
      .eq('guild_id', guildId)
      .eq('badge_id', badgeId);
    
    if (error) {
      return res.status(400).json({ 
        error: true, 
        message: error.message 
      });
    }
    
    res.status(200).json({
      message: 'Badge revoked from guild successfully'
    });
  } catch (err) {
    console.error('Revoke badge from guild error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error revoking badge' 
    });
  }
};

/**
 * Get all users who have a specific badge
 */
exports.getBadgeUsers = async (req, res) => {
  try {
    const { badgeId } = req.params;
    const creatorId = req.user.id;
    
    // Check if badge exists and user created it
    const { data: badge, error: badgeError } = await supabaseAdmin
      .from('badges')
      .select('created_by')
      .eq('id', badgeId)
      .single();
    
    if (badgeError) {
      return res.status(404).json({ 
        error: true, 
        message: 'Badge not found' 
      });
    }
    
    if (badge.created_by !== creatorId) {
      return res.status(403).json({ 
        error: true, 
        message: 'You can only view badge assignments for badges you created' 
      });
    }
    
    // Get all users who have this badge
    const { data: badgeAssignments, error } = await supabaseAdmin
      .from('user_badges')
      .select(`
        assigned_at,
        profiles:user_id (
          id,
          name,
          email,
          avatar_url
        )
      `)
      .eq('badge_id', badgeId)
      .order('assigned_at', { ascending: false });
    
    if (error) {
      return res.status(400).json({ 
        error: true, 
        message: error.message 
      });
    }
    
    // Format the response
    const users = badgeAssignments.map(assignment => ({
      id: assignment.profiles.id,
      name: assignment.profiles.name,
      email: assignment.profiles.email,
      avatar_url: assignment.profiles.avatar_url,
      assigned_at: assignment.assigned_at
    }));
    
    res.status(200).json({
      users
    });
  } catch (err) {
    console.error('Get badge users error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error fetching badge users' 
    });
  }
};

/**
 * Get all guilds that have a specific badge
 */
exports.getBadgeGuilds = async (req, res) => {
  try {
    const { badgeId } = req.params;
    const creatorId = req.user.id;
    
    // Check if badge exists and user created it
    const { data: badge, error: badgeError } = await supabaseAdmin
      .from('badges')
      .select('created_by')
      .eq('id', badgeId)
      .single();
    
    if (badgeError) {
      return res.status(404).json({ 
        error: true, 
        message: 'Badge not found' 
      });
    }
    
    if (badge.created_by !== creatorId) {
      return res.status(403).json({ 
        error: true, 
        message: 'You can only view badge assignments for badges you created' 
      });
    }
    
    // Get all guilds that have this badge
    const { data: badgeAssignments, error } = await supabaseAdmin
      .from('guild_badges')
      .select(`
        assigned_at,
        guilds:guild_id (
          id,
          name,
          description,
          icon_url
        )
      `)
      .eq('badge_id', badgeId)
      .order('assigned_at', { ascending: false });
    
    if (error) {
      return res.status(400).json({ 
        error: true, 
        message: error.message 
      });
    }
    
    // Format the response
    const guilds = badgeAssignments.map(assignment => ({
      id: assignment.guilds.id,
      name: assignment.guilds.name,
      description: assignment.guilds.description,
      icon_url: assignment.guilds.icon_url,
      assigned_at: assignment.assigned_at
    }));
    
    res.status(200).json({
      guilds
    });
  } catch (err) {
    console.error('Get badge guilds error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error fetching badge guilds' 
    });
  }
};

/**
 * Get all badges
 */
exports.getAllBadges = async (req, res) => {
  try {
    // Get pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Query to get badges with creator info
    const { data: badges, error, count } = await supabaseAdmin
      .from('badges')
      .select(`
        *,
        profiles:created_by (
          id,
          name,
          avatar_url
        )
      `, { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });
    
    if (error) {
      return res.status(400).json({ 
        error: true, 
        message: error.message 
      });
    }
    
    // Format the response data
    const formattedBadges = badges.map(badge => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon_url: badge.icon_url,
      created_at: badge.created_at,
      creator: badge.profiles ? {
        id: badge.profiles.id,
        name: badge.profiles.name,
        avatar_url: badge.profiles.avatar_url
      } : null
    }));
    
    res.status(200).json({
      badges: formattedBadges,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    console.error('Get all badges error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error fetching badges' 
    });
  }
};

/**
 * Verify if a user has a specific badge
 */
exports.verifyUserBadge = async (req, res) => {
  try {
    const { userId, badgeId } = req.params;
    
    // Check if user has the badge
    const { data, error } = await supabaseAdmin
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
      .eq('badge_id', badgeId)
      .maybeSingle();
    
    if (error) {
      return res.status(400).json({ 
        error: true, 
        message: error.message 
      });
    }
    
    res.status(200).json({
      has_badge: !!data
    });
  } catch (err) {
    console.error('Verify user badge error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error verifying badge' 
    });
  }
};

/**
 * Verify if a guild has a specific badge
 */
exports.verifyGuildBadge = async (req, res) => {
  try {
    const { guildId, badgeId } = req.params;
    
    // Check if guild has the badge
    const { data, error } = await supabaseAdmin
      .from('guild_badges')
      .select('*')
      .eq('guild_id', guildId)
      .eq('badge_id', badgeId)
      .maybeSingle();
    
    if (error) {
      return res.status(400).json({ 
        error: true, 
        message: error.message 
      });
    }
    
    res.status(200).json({
      has_badge: !!data
    });
  } catch (err) {
    console.error('Verify guild badge error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error verifying badge' 
    });
  }
};