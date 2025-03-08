/**
 * Guild controller for GoodGuilds API
 */
const { supabaseAdmin } = require('../utils/supabase');
const crypto = require('crypto');

/**
 * Create a new guild
 */
exports.createGuild = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, icon_url } = req.body;
    
    // Create guild in the database
    const { data: guild, error } = await supabaseAdmin
      .from('guilds')
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
    
    // Add the creator as an admin member
    const { error: memberError } = await supabaseAdmin
      .from('guild_members')
      .insert({
        user_id: userId,
        guild_id: guild.id,
        role: 'admin'
      });
    
    if (memberError) {
      console.error('Error adding creator as member:', memberError);
      // We could roll back the guild creation here if needed
      return res.status(500).json({ 
        error: true, 
        message: 'Guild created but failed to add you as a member' 
      });
    }
    
    res.status(201).json({
      message: 'Guild created successfully',
      guild
    });
  } catch (err) {
    console.error('Create guild error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error creating guild' 
    });
  }
};

/**
 * Get all guilds
 */
exports.getAllGuilds = async (req, res) => {
  try {
    // Get pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Query to get guilds with member count
    const { data: guilds, error, count } = await supabaseAdmin
      .from('guilds')
      .select(`
        *,
        guild_members:guild_members(count)
      `, { count: 'exact' })
      .range(offset, offset + limit - 1);
    
    if (error) {
      return res.status(400).json({ 
        error: true, 
        message: error.message 
      });
    }
    
    // Format the response data
    const formattedGuilds = guilds.map(guild => ({
      id: guild.id,
      name: guild.name,
      description: guild.description,
      icon_url: guild.icon_url,
      created_at: guild.created_at,
      created_by: guild.created_by,
      member_count: guild.guild_members[0]?.count || 0
    }));
    
    res.status(200).json({
      guilds: formattedGuilds,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    console.error('Get all guilds error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error fetching guilds' 
    });
  }
};

/**
 * Get guild by ID
 */
exports.getGuildById = async (req, res) => {
  try {
    const { guildId } = req.params;
    
    // Get the guild data
    const { data: guild, error } = await supabaseAdmin
      .from('guilds')
      .select(`
        *,
        guild_members:guild_members(count)
      `)
      .eq('id', guildId)
      .single();
    
    if (error) {
      return res.status(404).json({ 
        error: true, 
        message: 'Guild not found' 
      });
    }
    
    // Get guild members
    const { data: members, error: membersError } = await supabaseAdmin
      .from('guild_members')
      .select(`
        role,
        profiles:user_id (
          id,
          name,
          avatar_url
        )
      `)
      .eq('guild_id', guildId)
      .order('role', { ascending: false });
    
    if (membersError) {
      console.error('Error fetching guild members:', membersError);
    }
    
    // Get guild badges
    const { data: badges, error: badgesError } = await supabaseAdmin
      .from('guild_badges')
      .select(`
        badges (
          id,
          name,
          description,
          icon_url
        )
      `)
      .eq('guild_id', guildId);
    
    if (badgesError) {
      console.error('Error fetching guild badges:', badgesError);
    }
    
    // Format members data
    const formattedMembers = members?.map(member => ({
      id: member.profiles.id,
      name: member.profiles.name,
      avatar_url: member.profiles.avatar_url,
      role: member.role
    })) || [];
    
    // Format badges data
    const formattedBadges = badges?.map(badge => ({
      id: badge.badges.id,
      name: badge.badges.name,
      description: badge.badges.description,
      icon_url: badge.badges.icon_url
    })) || [];
    
    // Get user's role in guild if authenticated
    let userRole = null;
    if (req.user) {
      const { data: userMembership } = await supabaseAdmin
        .from('guild_members')
        .select('role')
        .eq('guild_id', guildId)
        .eq('user_id', req.user.id)
        .maybeSingle();
      
      if (userMembership) {
        userRole = userMembership.role;
      }
    }
    
    res.status(200).json({
      guild: {
        id: guild.id,
        name: guild.name,
        description: guild.description,
        icon_url: guild.icon_url,
        created_at: guild.created_at,
        created_by: guild.created_by,
        member_count: guild.guild_members[0]?.count || 0
      },
      members: formattedMembers,
      badges: formattedBadges,
      userRole
    });
  } catch (err) {
    console.error('Get guild by ID error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error fetching guild' 
    });
  }
};

/**
 * Update guild
 */
exports.updateGuild = async (req, res) => {
  try {
    const { guildId } = req.params;
    const userId = req.user.id;
    const { name, description, icon_url } = req.body;
    
    // Check if user is an admin of the guild
    const { data: membership, error: membershipError } = await supabaseAdmin
      .from('guild_members')
      .select('role')
      .eq('guild_id', guildId)
      .eq('user_id', userId)
      .single();
    
    if (membershipError || membership.role !== 'admin') {
      return res.status(403).json({ 
        error: true, 
        message: 'You must be an admin to update this guild' 
      });
    }
    
    // Update the guild
    const { data: guild, error } = await supabaseAdmin
      .from('guilds')
      .update({
        name: name || undefined,
        description: description || undefined,
        icon_url: icon_url || undefined,
        updated_at: new Date()
      })
      .eq('id', guildId)
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ 
        error: true, 
        message: error.message 
      });
    }
    
    res.status(200).json({
      message: 'Guild updated successfully',
      guild
    });
  } catch (err) {
    console.error('Update guild error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error updating guild' 
    });
  }
};

/**
 * Create guild invitation
 */
exports.createInvitation = async (req, res) => {
  try {
    const { guildId } = req.params;
    const userId = req.user.id;
    const { email, socialProvider, socialHandle } = req.body;
    
    // Check if user is an admin of the guild
    const { data: membership, error: membershipError } = await supabaseAdmin
      .from('guild_members')
      .select('role')
      .eq('guild_id', guildId)
      .eq('user_id', userId)
      .single();
    
    if (membershipError || membership.role !== 'admin') {
      return res.status(403).json({ 
        error: true, 
        message: 'You must be an admin to create invitations' 
      });
    }
    
    // Generate a unique token for the invitation
    const invitationToken = crypto.randomBytes(16).toString('hex');
    
    // Create the invitation
    const { data: invitation, error } = await supabaseAdmin
      .from('guild_invitations')
      .insert({
        guild_id: guildId,
        email,
        social_provider: socialProvider,
        social_handle: socialHandle,
        invitation_token: invitationToken,
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
      message: 'Invitation created successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        social_provider: invitation.social_provider,
        social_handle: invitation.social_handle,
        token: invitation.invitation_token,
        expires_at: invitation.expires_at
      }
    });
  } catch (err) {
    console.error('Create invitation error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error creating invitation' 
    });
  }
};

/**
 * Accept guild invitation
 */
exports.acceptInvitation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;
    
    // Find the invitation
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('guild_invitations')
      .select('*')
      .eq('invitation_token', token)
      .is('used_at', null)
      .single();
    
    if (invitationError || !invitation) {
      return res.status(404).json({ 
        error: true, 
        message: 'Invalid or expired invitation' 
      });
    }
    
    // Check if invitation is expired
    if (new Date(invitation.expires_at) < new Date()) {
      return res.status(400).json({ 
        error: true, 
        message: 'Invitation has expired' 
      });
    }
    
    // Check if this is a social invitation and if the user has the matching social account
    if (invitation.social_provider && invitation.social_handle) {
      // Get user's identities from Supabase Auth
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
      
      if (userError) {
        return res.status(400).json({ 
          error: true, 
          message: 'Error verifying user identity' 
        });
      }
      
      // Check if user has the required social identity
      let hasMatchingSocial = false;
      const identities = userData.user.identities || [];
      
      for (const identity of identities) {
        if (identity.provider === invitation.social_provider) {
          // For Twitter, the identity data has 'user_name' field
          const socialHandle = identity.identity_data?.user_name?.toLowerCase();
          if (socialHandle && socialHandle === invitation.social_handle.toLowerCase().replace('@', '')) {
            hasMatchingSocial = true;
            break;
          }
        }
      }
      
      if (!hasMatchingSocial && invitation.email !== userData.user.email) {
        return res.status(403).json({ 
          error: true, 
          message: `This invitation is for ${invitation.social_provider} user ${invitation.social_handle}. Please connect that account to your profile.` 
        });
      }
    } else if (invitation.email) {
      // Check if invitation has an email restriction
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
      
      if (userError) {
        return res.status(400).json({ 
          error: true, 
          message: 'Error verifying user identity' 
        });
      }
      
      // If invitation has email and user email doesn't match
      if (userData.user.email !== invitation.email) {
        return res.status(403).json({ 
          error: true, 
          message: `This invitation is for ${invitation.email}. Please use the correct account.` 
        });
      }
    }
    
    // Check if user is already a member of the guild
    const { data: existingMember, error: memberError } = await supabaseAdmin
      .from('guild_members')
      .select('*')
      .eq('guild_id', invitation.guild_id)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (existingMember) {
      return res.status(400).json({ 
        error: true, 
        message: 'You are already a member of this guild' 
      });
    }
    
    // Add user as a member to the guild
    const { error: addMemberError } = await supabaseAdmin
      .from('guild_members')
      .insert({
        user_id: userId,
        guild_id: invitation.guild_id,
        role: 'member'
      });
    
    if (addMemberError) {
      return res.status(400).json({ 
        error: true, 
        message: addMemberError.message 
      });
    }
    
    // Mark invitation as used
    const { error: updateInvitationError } = await supabaseAdmin
      .from('guild_invitations')
      .update({
        used_at: new Date(),
        used_by: userId
      })
      .eq('id', invitation.id);
    
    if (updateInvitationError) {
      console.error('Error updating invitation:', updateInvitationError);
    }
    
    // Get guild info
    const { data: guild } = await supabaseAdmin
      .from('guilds')
      .select('name')
      .eq('id', invitation.guild_id)
      .single();
    
    res.status(200).json({
      message: `You have successfully joined ${guild.name}!`,
      guild_id: invitation.guild_id,
      guild_name: guild.name
    });
  } catch (err) {
    console.error('Accept invitation error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error accepting invitation' 
    });
  }
};

/**
 * Leave guild
 */
exports.leaveGuild = async (req, res) => {
  try {
    const { guildId } = req.params;
    const userId = req.user.id;
    
    // Check if user is a member of the guild
    const { data: membership, error: membershipError } = await supabaseAdmin
      .from('guild_members')
      .select('*')
      .eq('guild_id', guildId)
      .eq('user_id', userId)
      .single();
    
    if (membershipError) {
      return res.status(404).json({ 
        error: true, 
        message: 'You are not a member of this guild' 
      });
    }
    
    // Check if user is the last admin
    if (membership.role === 'admin') {
      const { data: admins, error: adminsError } = await supabaseAdmin
        .from('guild_members')
        .select('*')
        .eq('guild_id', guildId)
        .eq('role', 'admin');
      
      if (!adminsError && admins.length === 1) {
        return res.status(400).json({ 
          error: true, 
          message: 'You are the last admin of this guild. Please promote another member or delete the guild.' 
        });
      }
    }
    
    // Remove user from guild
    const { data, error: leaveError, count } = await supabaseAdmin
      .from('guild_members')
      .delete()
      .eq('guild_id', guildId)
      .eq('user_id', userId)
      .select();
    
    if (leaveError) {
      return res.status(400).json({ 
        error: true, 
        message: leaveError.message 
      });
    }
    
    // Check if deletion was actually successful
    if (!data || data.length === 0) {
      console.error('Guild member deletion returned success but no rows were affected.');
      return res.status(400).json({ 
        error: true, 
        message: 'Failed to remove you from the guild. Please try again.' 
      });
    }
    
    // If the user joined through a social handle, update that record too
    try {
      await supabaseAdmin
        .from('guild_invited_handles')
        .update({ joined_at: null, joined_by: null })
        .eq('guild_id', guildId)
        .eq('joined_by', userId);
    } catch (inviteError) {
      console.error('Error updating invited handle record:', inviteError);
      // Continue with the process even if this fails
    }
    
    res.status(200).json({
      message: 'You have left the guild successfully',
      guild_id: guildId
    });
  } catch (err) {
    console.error('Leave guild error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error leaving guild' 
    });
  }
};

/**
 * Change member role
 */
exports.changeMemberRole = async (req, res) => {
  try {
    const { guildId, memberId } = req.params;
    const adminId = req.user.id;
    const { role } = req.body;
    
    console.log(`Role change request - Guild: ${guildId}, Member: ${memberId}, New role: ${role}`);
    
    // Validate role
    if (role !== 'admin' && role !== 'member') {
      return res.status(400).json({ 
        error: true, 
        message: 'Invalid role. Must be "admin" or "member".' 
      });
    }
    
    // Check if user is an admin of the guild
    const { data: adminMembership, error: adminMembershipError } = await supabaseAdmin
      .from('guild_members')
      .select('role')
      .eq('guild_id', guildId)
      .eq('user_id', adminId)
      .single();
    
    if (adminMembershipError || adminMembership.role !== 'admin') {
      return res.status(403).json({ 
        error: true, 
        message: 'You must be an admin to change member roles' 
      });
    }
    
    // Check if the target member exists
    const { data: targetMembership, error: targetMembershipError } = await supabaseAdmin
      .from('guild_members')
      .select('role')
      .eq('guild_id', guildId)
      .eq('user_id', memberId)
      .single();
    
    if (targetMembershipError) {
      return res.status(404).json({ 
        error: true, 
        message: 'Member not found in this guild' 
      });
    }
    
    console.log(`Current role of member: ${targetMembership.role}, Changing to: ${role}`);
    
    // If role is already set to the requested value, return success
    if (targetMembership.role === role) {
      console.log('Role is already set to the requested value, returning early');
      return res.status(200).json({
        message: `Member already has the role: ${role}`,
        member: {
          id: memberId,
          role: role
        }
      });
    }
    
    // Prevent admin from demoting themselves if they are the last admin
    if (adminId === memberId && role === 'member') {
      const { data: admins, error: adminsError } = await supabaseAdmin
        .from('guild_members')
        .select('*')
        .eq('guild_id', guildId)
        .eq('role', 'admin');
      
      if (!adminsError && admins.length === 1) {
        return res.status(400).json({ 
          error: true, 
          message: 'You are the last admin of this guild. Please promote another member first.' 
        });
      }
    }
    
    // Try a more direct approach without setting updated_at (leave it to the trigger)
    console.log('Executing role update in database...');
    
    const updateResult = await supabaseAdmin
      .from('guild_members')
      .update({ role })
      .eq('guild_id', guildId)
      .eq('user_id', memberId);
    
    console.log('Update result:', updateResult);
    
    if (updateResult.error) {
      console.error('Database update error:', updateResult.error);
      return res.status(400).json({ 
        error: true, 
        message: `Database error: ${updateResult.error.message}` 
      });
    }
    
    // Double-check the update worked by re-fetching
    const { data: verifyUpdate, error: verifyError } = await supabaseAdmin
      .from('guild_members')
      .select('role')
      .eq('guild_id', guildId)
      .eq('user_id', memberId)
      .single();
    
    if (verifyError) {
      console.error('Error verifying update:', verifyError);
      return res.status(500).json({ 
        error: true, 
        message: 'Error verifying role update' 
      });
    }
    
    console.log(`Verified new role: ${verifyUpdate.role}`);
    
    // Get the member's name
    const { data: member } = await supabaseAdmin
      .from('profiles')
      .select('name')
      .eq('id', memberId)
      .single();
    
    // Create response with verification of the actual role
    const memberName = member?.name || 'Member';
    
    res.status(200).json({
      message: `${memberName}'s role has been updated to ${verifyUpdate.role}`,
      member: {
        id: memberId,
        role: verifyUpdate.role
      }
    });
  } catch (err) {
    console.error('Change member role error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error changing member role' 
    });
  }
};