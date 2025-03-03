/**
 * Guild Invitations Controller
 * Manages different types of invitations to join guilds
 */
const { supabaseAdmin } = require('../utils/supabase');

/**
 * Get all invitations for a guild
 */
exports.getInvitations = async (req, res) => {
  try {
    const { guildId } = req.params;
    const userId = req.user.id;
    
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
        message: 'You must be an admin to view invitations' 
      });
    }
    
    // Get all invitations
    const { data: invitations, error } = await supabaseAdmin
      .from('guild_invitations')
      .select(`
        id,
        email,
        social_provider,
        social_handle,
        invitation_token,
        created_at,
        expires_at,
        used_at,
        profiles:created_by (
          id,
          name
        ),
        used_profiles:used_by (
          id,
          name,
          email
        )
      `)
      .eq('guild_id', guildId)
      .order('created_at', { ascending: false });
    
    if (error) {
      return res.status(400).json({ 
        error: true, 
        message: error.message 
      });
    }
    
    // Format the response based on invitation type
    const formattedInvitations = invitations.map(invitation => {
      const baseInvitation = {
        id: invitation.id,
        createdAt: invitation.created_at,
        expiresAt: invitation.expires_at,
        used: invitation.used_at !== null,
        usedAt: invitation.used_at,
        createdBy: {
          id: invitation.profiles.id,
          name: invitation.profiles.name
        },
        invitationType: 'open' // default
      };
      
      // Add user info if invitation was used
      if (invitation.used_at && invitation.used_profiles) {
        baseInvitation.usedBy = {
          id: invitation.used_profiles.id,
          name: invitation.used_profiles.name,
          email: invitation.used_profiles.email
        };
      }
      
      // Determine invitation type and add type-specific fields
      if (invitation.email) {
        baseInvitation.invitationType = 'email';
        baseInvitation.email = invitation.email;
      } else if (invitation.social_provider && invitation.social_handle) {
        baseInvitation.invitationType = 'social';
        baseInvitation.socialProvider = invitation.social_provider;
        baseInvitation.socialHandle = invitation.social_handle;
      }
      
      // For active invitations, include the token for link generation
      if (!invitation.used_at) {
        baseInvitation.token = invitation.invitation_token;
      }
      
      return baseInvitation;
    });
    
    res.status(200).json({
      invitations: formattedInvitations
    });
  } catch (err) {
    console.error('Get invitations error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error fetching invitations' 
    });
  }
};

/**
 * Revoke/delete an invitation
 */
exports.revokeInvitation = async (req, res) => {
  try {
    const { guildId, invitationId } = req.params;
    const userId = req.user.id;
    
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
        message: 'You must be an admin to revoke invitations' 
      });
    }
    
    // Verify the invitation exists and belongs to this guild
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('guild_invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('guild_id', guildId)
      .single();
    
    if (invitationError) {
      return res.status(404).json({ 
        error: true, 
        message: 'Invitation not found' 
      });
    }
    
    // Don't allow revoking used invitations
    if (invitation.used_at !== null) {
      return res.status(400).json({ 
        error: true, 
        message: 'Cannot revoke an invitation that has already been used' 
      });
    }
    
    // Delete the invitation
    const { error } = await supabaseAdmin
      .from('guild_invitations')
      .delete()
      .eq('id', invitationId);
    
    if (error) {
      return res.status(400).json({ 
        error: true, 
        message: error.message 
      });
    }
    
    res.status(200).json({
      message: 'Invitation revoked successfully',
    });
  } catch (err) {
    console.error('Revoke invitation error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error revoking invitation' 
    });
  }
};

/**
 * Get guild URL for social invitation
 */
exports.getGuildUrl = async (req, res) => {
  try {
    const { guildId } = req.params;
    
    // Verify guild exists
    const { data: guild, error } = await supabaseAdmin
      .from('guilds')
      .select('name')
      .eq('id', guildId)
      .single();
    
    if (error) {
      return res.status(404).json({ 
        error: true, 
        message: 'Guild not found' 
      });
    }
    
    // Generate URL to the guild
    const guildUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/guilds/${guildId}`;
    
    res.status(200).json({
      guildUrl,
      guildName: guild.name
    });
  } catch (err) {
    console.error('Get guild URL error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error generating guild URL' 
    });
  }
};