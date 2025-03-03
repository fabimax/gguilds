/**
 * Guild Invited Handles Controller
 * Manages social media handles pre-approved to join guilds
 */
const { supabaseAdmin } = require('../utils/supabase');

/**
 * Add a social media handle to the guild's invited handles list
 */
exports.addInvitedHandle = async (req, res) => {
  try {
    const { guildId } = req.params;
    const userId = req.user.id;
    const { socialProvider, socialHandle } = req.body;
    
    // Validate required fields
    if (!socialProvider || !socialHandle) {
      return res.status(400).json({ 
        error: true, 
        message: 'Social provider and handle are required' 
      });
    }
    
    // Normalize the handle by removing @ if present
    const normalizedHandle = socialHandle.startsWith('@') 
      ? socialHandle.substring(1) 
      : socialHandle;
      
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
        message: 'You must be an admin to manage invited handles' 
      });
    }
    
    // Check if handle is already invited
    const { data: existingInvite, error: existingError } = await supabaseAdmin
      .from('guild_invited_handles')
      .select('*')
      .eq('guild_id', guildId)
      .eq('social_provider', socialProvider)
      .ilike('social_handle', normalizedHandle)
      .is('joined_at', null)
      .maybeSingle();
    
    if (existingInvite) {
      return res.status(400).json({ 
        error: true, 
        message: `This ${socialProvider} handle is already invited` 
      });
    }
    
    // Add the handle to invited handles
    const { data: invitedHandle, error } = await supabaseAdmin
      .from('guild_invited_handles')
      .insert({
        guild_id: guildId,
        social_provider: socialProvider,
        social_handle: normalizedHandle,
        invited_by: userId
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
      message: `@${normalizedHandle} has been added to invited handles`,
      invitedHandle
    });
  } catch (err) {
    console.error('Add invited handle error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error adding invited handle' 
    });
  }
};

/**
 * Get all invited handles for a guild
 */
exports.getInvitedHandles = async (req, res) => {
  try {
    const { guildId } = req.params;
    
    // Get all invited handles that haven't joined yet
    const { data: invitedHandles, error } = await supabaseAdmin
      .from('guild_invited_handles')
      .select(`
        id,
        social_provider,
        social_handle,
        created_at,
        profiles:invited_by (
          id,
          name
        )
      `)
      .eq('guild_id', guildId)
      .is('joined_at', null)
      .order('created_at', { ascending: false });
    
    if (error) {
      return res.status(400).json({ 
        error: true, 
        message: error.message 
      });
    }
    
    // Format the response
    const formattedHandles = invitedHandles.map(handle => ({
      id: handle.id,
      socialProvider: handle.social_provider,
      socialHandle: handle.social_handle,
      createdAt: handle.created_at,
      invitedBy: {
        id: handle.profiles.id,
        name: handle.profiles.name
      }
    }));
    
    res.status(200).json({
      invitedHandles: formattedHandles
    });
  } catch (err) {
    console.error('Get invited handles error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error fetching invited handles' 
    });
  }
};

/**
 * Remove an invited handle
 */
exports.removeInvitedHandle = async (req, res) => {
  try {
    const { guildId, handleId } = req.params;
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
        message: 'You must be an admin to manage invited handles' 
      });
    }
    
    // Verify the handle exists and belongs to this guild
    const { data: handle, error: handleError } = await supabaseAdmin
      .from('guild_invited_handles')
      .select('social_handle')
      .eq('id', handleId)
      .eq('guild_id', guildId)
      .single();
    
    if (handleError) {
      return res.status(404).json({ 
        error: true, 
        message: 'Invited handle not found' 
      });
    }
    
    // Delete the invited handle
    const { error } = await supabaseAdmin
      .from('guild_invited_handles')
      .delete()
      .eq('id', handleId);
    
    if (error) {
      return res.status(400).json({ 
        error: true, 
        message: error.message 
      });
    }
    
    res.status(200).json({
      message: `@${handle.social_handle} has been removed from invited handles`,
    });
  } catch (err) {
    console.error('Remove invited handle error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error removing invited handle' 
    });
  }
};

/**
 * Check if current user has an eligible social handle to join a guild
 */
exports.checkEligibility = async (req, res) => {
  try {
    const { guildId } = req.params;
    const userId = req.user.id;
    
    // Check if user is already a member of the guild
    const { data: existingMember, error: memberError } = await supabaseAdmin
      .from('guild_members')
      .select('*')
      .eq('guild_id', guildId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (existingMember) {
      return res.status(200).json({ 
        eligible: false,
        message: 'You are already a member of this guild',
        alreadyMember: true
      });
    }
    
    // Get user's identities from Supabase Auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError) {
      return res.status(400).json({ 
        error: true, 
        message: 'Error verifying user identity' 
      });
    }
    
    // Check against invited handles
    let eligibleHandle = null;
    const identities = userData.user.identities || [];
    
    for (const identity of identities) {
      // For each social provider the user has connected
      const provider = identity.provider;
      
      // For Twitter, the identity data has 'user_name' field
      if (provider === 'twitter' && identity.identity_data?.user_name) {
        const handle = identity.identity_data.user_name.toLowerCase();
        
        // Check if this handle is invited
        const { data: invitedHandle, error: inviteError } = await supabaseAdmin
          .from('guild_invited_handles')
          .select('id, social_handle')
          .eq('guild_id', guildId)
          .eq('social_provider', provider)
          .ilike('social_handle', handle)
          .is('joined_at', null)
          .maybeSingle();
        
        if (invitedHandle) {
          eligibleHandle = {
            id: invitedHandle.id,
            provider,
            handle: invitedHandle.social_handle
          };
          break;
        }
      }
      
      // Add similar blocks for other providers as needed
    }
    
    if (eligibleHandle) {
      res.status(200).json({
        eligible: true,
        handle: eligibleHandle
      });
    } else {
      res.status(200).json({
        eligible: false,
        message: 'None of your connected social accounts are invited to this guild'
      });
    }
  } catch (err) {
    console.error('Check eligibility error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error checking eligibility' 
    });
  }
};

/**
 * Join guild using invited handle
 */
exports.joinWithInvitedHandle = async (req, res) => {
  try {
    const { guildId } = req.params;
    const userId = req.user.id;
    const { invitedHandleId } = req.body;
    
    // Check if user is already a member
    const { data: existingMember, error: memberError } = await supabaseAdmin
      .from('guild_members')
      .select('*')
      .eq('guild_id', guildId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (existingMember) {
      return res.status(400).json({ 
        error: true, 
        message: 'You are already a member of this guild' 
      });
    }
    
    // Verify the invited handle exists, belongs to this guild, and hasn't been used
    const { data: invitedHandle, error: handleError } = await supabaseAdmin
      .from('guild_invited_handles')
      .select('social_provider, social_handle')
      .eq('id', invitedHandleId)
      .eq('guild_id', guildId)
      .is('joined_at', null)
      .single();
    
    if (handleError) {
      return res.status(404).json({ 
        error: true, 
        message: 'Invited handle not found or already used' 
      });
    }
    
    // Verify the user has the matching social identity
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError) {
      return res.status(400).json({ 
        error: true, 
        message: 'Error verifying user identity' 
      });
    }
    
    // Check for matching social identity
    let hasMatchingIdentity = false;
    const identities = userData.user.identities || [];
    
    for (const identity of identities) {
      if (identity.provider === invitedHandle.social_provider) {
        // For Twitter, check username
        if (invitedHandle.social_provider === 'twitter') {
          const userHandle = identity.identity_data?.user_name?.toLowerCase();
          if (userHandle && userHandle === invitedHandle.social_handle.toLowerCase()) {
            hasMatchingIdentity = true;
            break;
          }
        }
        // Add similar checks for other providers as needed
      }
    }
    
    if (!hasMatchingIdentity) {
      return res.status(403).json({ 
        error: true, 
        message: `You don't have a matching ${invitedHandle.social_provider} account (@${invitedHandle.social_handle})` 
      });
    }
    
    // Add user as a member
    const { error: addMemberError } = await supabaseAdmin
      .from('guild_members')
      .insert({
        user_id: userId,
        guild_id: guildId,
        role: 'member'
      });
    
    if (addMemberError) {
      return res.status(400).json({ 
        error: true, 
        message: addMemberError.message 
      });
    }
    
    // Mark the invited handle as used
    const { error: updateHandleError } = await supabaseAdmin
      .from('guild_invited_handles')
      .update({
        joined_at: new Date(),
        joined_by: userId
      })
      .eq('id', invitedHandleId);
    
    if (updateHandleError) {
      console.error('Error updating invited handle:', updateHandleError);
    }
    
    // Get guild info
    const { data: guild } = await supabaseAdmin
      .from('guilds')
      .select('name')
      .eq('id', guildId)
      .single();
    
    res.status(200).json({
      message: `You have successfully joined ${guild.name}!`,
      guild_id: guildId,
      guild_name: guild.name
    });
  } catch (err) {
    console.error('Join with invited handle error:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error joining guild' 
    });
  }
};