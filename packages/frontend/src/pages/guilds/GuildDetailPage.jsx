/**
 * Guild Detail Page component
 * Shows detailed information about a specific guild, members, badges
 * Provides functionality to join, leave, invite members, and manage the guild
 */
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '@/stores/authStore';
import useAuthStore from '@/stores/authStore';

const GuildDetailPage = () => {
  const { guildId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [guild, setGuild] = useState(null);
  const [members, setMembers] = useState([]);
  const [badges, setBadges] = useState([]);
  const [userRole, setUserRole] = useState(null); // 'admin', 'member', or null

  // Modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [inviteType, setInviteType] = useState('open');
  
  // Add state for existing invitations
  const [invitations, setInvitations] = useState([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [revokingInvitation, setRevokingInvitation] = useState(null);

  // Form states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [socialJoinUrl, setSocialJoinUrl] = useState('');

  // State for invited handles
  const [invitedHandles, setInvitedHandles] = useState([]);
  const [invitedHandlesLoading, setInvitedHandlesLoading] = useState(false);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [eligibleHandle, setEligibleHandle] = useState(null);
  const [joiningWithHandle, setJoiningWithHandle] = useState(false);
  
  // Form for invited handles
  const [newSocialProvider, setNewSocialProvider] = useState('twitter');
  const [newSocialHandle, setNewSocialHandle] = useState('');
  const [addingHandle, setAddingHandle] = useState(false);
  
  // Edit form states
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIconUrl, setEditIconUrl] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  
  // Selected member for role change
  const [selectedMember, setSelectedMember] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [roleLoading, setRoleLoading] = useState(false);
  
  // Leave guild loading state
  const [leaveLoading, setLeaveLoading] = useState(false);

  // Handle showing the invite modal
  const handleShowInviteModal = async () => {
    setShowInviteModal(true);
    
    // Fetch invitations list
    fetchInvitations();
    
    // Fetch guild URL for social invitations
    fetchGuildUrl();
  };
  
  // Fetch guild data
  useEffect(() => {
    const fetchGuildData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/guilds/${guildId}`);
        
        setGuild(response.data.guild);
        setMembers(response.data.members);
        setBadges(response.data.badges);
        setUserRole(response.data.userRole);
        
        // Initialize edit form with current values
        setEditName(response.data.guild.name);
        setEditDescription(response.data.guild.description || '');
        setEditIconUrl(response.data.guild.icon_url || '');
        
        // Fetch invited handles
        fetchInvitedHandles();
        
        // Check if user is eligible to join with a social handle
        if (!response.data.userRole) {
          checkEligibility();
        }
      } catch (error) {
        console.error('Failed to fetch guild data:', error);
        toast.error('Failed to load guild');
        navigate('/guilds');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGuildData();
  }, [guildId, navigate]);
  
  // Fetch guild invitations
  const fetchInvitations = async () => {
    try {
      setInvitationsLoading(true);
      const response = await api.get(`/guilds/${guildId}/invitations`);
      setInvitations(response.data.invitations);
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
      toast.error('Failed to load invitations');
    } finally {
      setInvitationsLoading(false);
    }
  };
  
  // Get guild URL for social invitations
  const fetchGuildUrl = async () => {
    try {
      const response = await api.get(`/guilds/${guildId}/invitation-url`);
      setSocialJoinUrl(response.data.guildUrl);
    } catch (error) {
      console.error('Failed to get guild URL:', error);
    }
  };
  
  // Revoke an invitation
  const handleRevokeInvitation = async (invitationId) => {
    if (!confirm('Are you sure you want to revoke this invitation?')) {
      return;
    }
    
    try {
      setRevokingInvitation(invitationId);
      
      await api.delete(`/guilds/${guildId}/invitations/${invitationId}`);
      
      // Remove from state immediately for responsiveness
      setInvitations(invitations.filter(invitation => invitation.id !== invitationId));
      toast.success('Invitation revoked successfully');
    } catch (error) {
      console.error('Failed to revoke invitation:', error);
      toast.error('Failed to revoke invitation');
    } finally {
      setRevokingInvitation(null);
    }
  };
  
  // Fetch invited handles
  const fetchInvitedHandles = async () => {
    try {
      setInvitedHandlesLoading(true);
      const response = await api.get(`/guilds/${guildId}/invited-handles`);
      setInvitedHandles(response.data.invitedHandles);
    } catch (error) {
      console.error('Failed to fetch invited handles:', error);
    } finally {
      setInvitedHandlesLoading(false);
    }
  };
  
  // Check if user is eligible to join with a social handle
  const checkEligibility = async () => {
    // Only check eligibility if logged in and not already a member
    if (!user) return;
    
    try {
      const response = await api.get(`/guilds/${guildId}/check-eligibility`);
      setEligibilityChecked(true);
      
      if (response.data.eligible) {
        setIsEligible(true);
        setEligibleHandle(response.data.handle);
      } else {
        setIsEligible(false);
      }
    } catch (error) {
      console.error('Failed to check eligibility:', error);
    }
  };
  
  // Join guild with eligible social handle
  const handleJoinWithHandle = async () => {
    if (!eligibleHandle) return;
    
    try {
      setJoiningWithHandle(true);
      
      const response = await api.post(`/guilds/${guildId}/join-with-handle`, {
        invitedHandleId: eligibleHandle.id
      });
      
      toast.success(response.data.message);
      
      // Update user role and refresh guild data
      setUserRole('member');
      setIsEligible(false);
      setEligibleHandle(null);
      
      // Refresh members list
      const membersResponse = await api.get(`/guilds/${guildId}`);
      setMembers(membersResponse.data.members);
    } catch (error) {
      console.error('Failed to join guild:', error);
      toast.error(error.response?.data?.message || 'Failed to join guild');
    } finally {
      setJoiningWithHandle(false);
    }
  };
  
  // Add a new social handle to invited handles
  const handleAddInvitedHandle = async () => {
    try {
      setAddingHandle(true);
      
      const response = await api.post(`/guilds/${guildId}/invited-handles`, {
        socialProvider: newSocialProvider,
        socialHandle: newSocialHandle
      });
      
      toast.success(response.data.message);
      setNewSocialHandle('');
      
      // Refresh invited handles list
      fetchInvitedHandles();
    } catch (error) {
      console.error('Failed to add invited handle:', error);
      toast.error(error.response?.data?.message || 'Failed to add invited handle');
    } finally {
      setAddingHandle(false);
    }
  };
  
  // Remove an invited handle
  const handleRemoveInvitedHandle = async (handleId) => {
    try {
      await api.delete(`/guilds/${guildId}/invited-handles/${handleId}`);
      
      // Remove from state immediately for responsiveness
      setInvitedHandles(invitedHandles.filter(handle => handle.id !== handleId));
      toast.success('Handle removed from invited list');
    } catch (error) {
      console.error('Failed to remove invited handle:', error);
      toast.error('Failed to remove invited handle');
    }
  };

  // Update guild function
  const handleUpdateGuild = async (e) => {
    e.preventDefault();
    
    try {
      setEditLoading(true);
      
      const response = await api.put(`/guilds/${guildId}`, {
        name: editName,
        description: editDescription,
        icon_url: editIconUrl
      });
      
      setGuild(response.data.guild);
      setShowEditModal(false);
      toast.success('Guild updated successfully');
    } catch (error) {
      console.error('Failed to update guild:', error);
      toast.error(error.response?.data?.message || 'Failed to update guild');
    } finally {
      setEditLoading(false);
    }
  };
  
  // Change member role function
  const handleChangeRole = async (e) => {
    e.preventDefault();
    
    try {
      setRoleLoading(true);
      
      await api.put(`/guilds/${guildId}/members/${selectedMember.id}`, {
        role: newRole
      });
      
      // Update members list
      setMembers(members.map(member => 
        member.id === selectedMember.id 
          ? { ...member, role: newRole } 
          : member
      ));
      
      setShowRoleModal(false);
      toast.success(`${selectedMember.name}'s role has been updated to ${newRole}`);
    } catch (error) {
      console.error('Failed to change role:', error);
      toast.error(error.response?.data?.message || 'Failed to change role');
    } finally {
      setRoleLoading(false);
    }
  };
  
  // Leave guild function
  const handleLeaveGuild = async () => {
    if (!confirm('Are you sure you want to leave this guild?')) {
      return;
    }
    
    try {
      setLeaveLoading(true);
      
      await api.delete(`/guilds/${guildId}/members`);
      
      toast.success('You have left the guild');
      navigate('/guilds');
    } catch (error) {
      console.error('Failed to leave guild:', error);
      toast.error(error.response?.data?.message || 'Failed to leave guild');
    } finally {
      setLeaveLoading(false);
    }
  };
  
  // Copy invitation link
  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success('Invitation link copied to clipboard');
  };
  
  // Open role change modal
  const openRoleModal = (member) => {
    setSelectedMember(member);
    setNewRole(member.role);
    setShowRoleModal(true);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!guild) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Guild not found</h2>
        <Link to="/guilds" className="btn btn-primary">
          Back to Guilds
        </Link>
      </div>
    );
  }
  
  // Guild header with icon and description
  const GuildHeader = () => (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        {guild.icon_url ? (
          <img
            src={guild.icon_url}
            alt={guild.name}
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-600 font-bold text-3xl">
              {guild.name.charAt(0)}
            </span>
          </div>
        )}
        
        <div>
          <h1 className="text-3xl font-bold">{guild.name}</h1>
          <p className="text-gray-500">
            {guild.member_count} {guild.member_count === 1 ? 'member' : 'members'} • Created {new Date(guild.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      {guild.description && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <p>{guild.description}</p>
        </div>
      )}
    </div>
  );
  
  // Guild actions (join, leave, edit, invite)
  const GuildActions = () => (
    <div className="mb-8">
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          {userRole === 'admin' && (
            <>
              <button
                onClick={() => setShowEditModal(true)}
                className="btn btn-primary"
              >
                Edit Guild
              </button>
              <button
                onClick={handleShowInviteModal}
                className="btn btn-primary"
              >
                Invitations
              </button>
            </>
          )}
          
          {userRole === 'member' && (
            <button
              onClick={handleLeaveGuild}
              className="btn btn-outline text-red-600 border-red-600 hover:bg-red-50"
              disabled={leaveLoading}
            >
              {leaveLoading ? 'Leaving...' : 'Leave Guild'}
            </button>
          )}
          
          {!userRole && isEligible && eligibleHandle && (
            <div className="w-full">
              <div className="bg-green-50 border border-green-200 rounded p-3 mb-3 text-green-800">
                <p>
                  You're invited to join this guild with your {eligibleHandle.provider === 'twitter' ? 'Twitter/X' : eligibleHandle.provider} account:
                  <span className="font-semibold ml-1">@{eligibleHandle.handle}</span>
                </p>
              </div>
              
              <button
                onClick={handleJoinWithHandle}
                className="btn btn-primary"
                disabled={joiningWithHandle}
              >
                {joiningWithHandle ? 'Joining...' : 'Join Guild Now'}
              </button>
            </div>
          )}
          
          {!userRole && !isEligible && eligibilityChecked && (
            <button
              className="btn btn-outline"
              disabled={true}
            >
              Invitation Only
            </button>
          )}
          
          {!userRole && !eligibilityChecked && (
            <div className="flex items-center">
              <div className="w-5 h-5 border-t-2 border-primary-600 border-solid rounded-full animate-spin mr-2"></div>
              <span>Checking eligibility...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
  // Guild members section
  const MembersSection = () => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Members</h2>
      <div className="card">
        {members.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No members found
          </div>
        ) : (
          <div className="divide-y">
            {members.map((member) => (
              <div key={member.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={member.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <span className="text-gray-600 font-medium">
                        {member.name ? member.name.charAt(0) : 'U'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{member.name || 'Unknown User'}</p>
                    <span className={`badge ${
                      member.role === 'admin' ? 'badge-primary' : 'bg-gray-100'
                    }`}>
                      {member.role}
                    </span>
                  </div>
                </div>
                
                {userRole === 'admin' && user.id !== member.id && (
                  <button
                    onClick={() => openRoleModal(member)}
                    className="text-sm text-primary-600 hover:text-primary-800"
                  >
                    Change Role
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
  
  // Guild badges section
  const BadgesSection = () => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Badges</h2>
      <div className="card">
        {badges.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="mb-2">This guild hasn't earned any badges yet</p>
            {userRole === 'admin' && (
              <p className="text-sm">Badges will be awarded by external applications</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
            {badges.map((badge) => (
              <div key={badge.id} className="text-center">
                <div className="mb-2">
                  {badge.icon_url ? (
                    <img
                      src={badge.icon_url}
                      alt={badge.name}
                      className="w-16 h-16 mx-auto"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                      <span className="text-gray-600 font-medium">
                        {badge.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <p className="font-medium">{badge.name}</p>
                {badge.description && (
                  <p className="text-xs text-gray-500">{badge.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
  
  // Invite Modal with updated tabs order and invitation management
  const InviteModal = () => {
    // We need these modal-specific state variables that don't affect parent re-renders
    const [modalEmail, setModalEmail] = useState(inviteEmail);
    const [modalSocialHandle, setModalSocialHandle] = useState(newSocialHandle);
    const [modalSocialProvider, setModalSocialProvider] = useState(newSocialProvider);
    
    // Get filtered invitations based on current tab
    const filteredInvitations = invitations.filter(invitation => {
      if (inviteType === 'open') return invitation.invitationType === 'open';
      if (inviteType === 'email') return invitation.invitationType === 'email';
      if (inviteType === 'social') return invitation.invitationType === 'social';
      return false;
    });
    
    // Reset form fields when changing tabs
    const handleTabChange = (tabName) => {
      setInviteType(tabName);
      
      // Reset link when changing tabs
      setInviteLink('');
    };
    
    // Copy the social join URL
    const copySocialJoinUrl = () => {
      navigator.clipboard.writeText(socialJoinUrl);
      toast.success('Guild link copied to clipboard');
    };
    
    const handleInviteSubmit = async (e) => {
      e.preventDefault();
      
      try {
        setInviteLoading(true);
        
        let requestData = {};
        
        if (inviteType === 'email' && modalEmail) {
          requestData.email = modalEmail;
          setInviteEmail(modalEmail); // Sync back to parent
        } else if (inviteType === 'social' && modalSocialHandle) {
          // This is now handled by the handleAddInvitedHandle function
          return;
        }
        // For open invitations, just leave requestData empty
        
        const response = await api.post(`/guilds/${guildId}/invitations`, requestData);
        
        // Generate invitation link
        const invitationToken = response.data.invitation.token;
        const inviteUrl = `${window.location.origin}/invite?token=${invitationToken}`;
        
        setInviteLink(inviteUrl);
        toast.success('Invitation created successfully');
        
        // Refresh invitations list
        fetchInvitations();
      } catch (error) {
        console.error('Failed to create invitation:', error);
        toast.error(error.response?.data?.message || 'Failed to create invitation');
      } finally {
        setInviteLoading(false);
      }
    };
    
    // Handle adding a social handle
    const handleModalAddHandle = async () => {
      // Update parent state first
      setNewSocialProvider(modalSocialProvider);
      setNewSocialHandle(modalSocialHandle);
      
      try {
        setAddingHandle(true);
        
        const response = await api.post(`/guilds/${guildId}/invited-handles`, {
          socialProvider: modalSocialProvider,
          socialHandle: modalSocialHandle
        });
        
        toast.success(response.data.message);
        setModalSocialHandle('');
        
        // Refresh invited handles list
        fetchInvitedHandles();
      } catch (error) {
        console.error('Failed to add invited handle:', error);
        toast.error(error.response?.data?.message || 'Failed to add invited handle');
      } finally {
        setAddingHandle(false);
      }
    };
    
    // Format date in a readable format
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };
    
    // Render the appropriate invitation form
    const renderInvitationForm = () => {
      if (inviteLink) {
        return (
          <div className="mb-6">
            <p className="mb-2 text-green-600 font-medium">Invitation created!</p>
            <div className="flex items-center">
              <input
                type="text"
                className="input flex-grow"
                value={inviteLink}
                readOnly
              />
              <button
                onClick={copyInviteLink}
                className="ml-2 p-2 bg-gray-100 rounded hover:bg-gray-200"
                title="Copy to clipboard"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Share this link with the person you want to invite. The link will expire in 7 days.
            </p>
            
            <div className="mt-4">
              <button
                onClick={() => setInviteLink('')}
                className="btn btn-primary"
              >
                Create Another Invitation
              </button>
            </div>
          </div>
        );
      }
      
      // Open Invitation Form
      if (inviteType === 'open') {
        return (
          <form onSubmit={handleInviteSubmit} className="mb-6">
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
              <h3 className="font-medium mb-2">Open Invitation Link</h3>
              <p className="text-sm">
                This will create an invitation link that anyone can use to join the guild.
                This is less secure and should be used with caution.
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={inviteLoading}
              >
                {inviteLoading ? 'Creating...' : 'Create Open Invitation'}
              </button>
            </div>
          </form>
        );
      }
      
      // Email Invitation Form
      if (inviteType === 'email') {
        return (
          <form onSubmit={handleInviteSubmit} className="mb-6">
            <div className="mb-4">
              <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="inviteEmail"
                type="email"
                className="input"
                value={modalEmail}
                onChange={(e) => setModalEmail(e.target.value)}
                placeholder="member@example.com"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                An invitation link will be generated that only this email can use.
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={inviteLoading || !modalEmail.trim()}
              >
                {inviteLoading ? 'Creating...' : 'Create Email Invitation'}
              </button>
            </div>
          </form>
        );
      }
      
      // Social Media Invitation Form (Invited Handles)
      if (inviteType === 'social') {
        return (
          <div>
            {/* Add new handle form */}
            <div className="mb-6 bg-gray-50 p-4 rounded">
              <h3 className="font-medium mb-3">Add Social Media Handle</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  className="input sm:w-1/3"
                  value={modalSocialProvider}
                  onChange={(e) => setModalSocialProvider(e.target.value)}
                >
                  <option value="twitter">Twitter/X</option>
                  {/* Add other social providers here as they become supported */}
                </select>
                
                <div className="flex sm:flex-1">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    @
                  </span>
                  <input
                    type="text"
                    className="input rounded-l-none flex-1"
                    value={modalSocialHandle}
                    onChange={(e) => setModalSocialHandle(e.target.value.replace('@', ''))}
                    placeholder="username"
                  />
                </div>
                
                <button
                  onClick={handleModalAddHandle}
                  className="btn btn-primary"
                  disabled={addingHandle || !modalSocialHandle.trim()}
                >
                  {addingHandle ? 'Adding...' : 'Add Handle'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Users with these social media accounts will be able to join the guild directly.
              </p>
            </div>
            
            {/* Guild URL for Sharing */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded">
              <h3 className="font-medium mb-3">Share Guild Link</h3>
              <p className="text-sm mb-3">
                Share this link with invited users. They will see a "Join Guild Now" button if their social account has been invited.
              </p>
              <div className="flex items-center">
                <input
                  type="text"
                  className="input flex-grow"
                  value={socialJoinUrl}
                  readOnly
                />
                <button
                  onClick={copySocialJoinUrl}
                  className="ml-2 p-2 bg-gray-100 rounded hover:bg-gray-200"
                  title="Copy to clipboard"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      }
      
      return null;
    };
    
    // Render the list of existing invitations
    const renderInvitationsList = () => {
      if (invitationsLoading) {
        return (
          <div className="flex justify-center py-6">
            <div className="w-8 h-8 border-t-2 border-primary-600 border-solid rounded-full animate-spin"></div>
          </div>
        );
      }
      
      if (filteredInvitations.length === 0) {
        return (
          <div className="text-center py-6 bg-gray-50 rounded">
            <p className="text-gray-500">No {inviteType} invitations yet</p>
          </div>
        );
      }
      
      return (
        <div className="overflow-y-auto max-h-64 border rounded">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {inviteType === 'email' && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                )}
                {inviteType === 'social' && (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Handle
                    </th>
                  </>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvitations.map((invitation) => (
                <tr key={invitation.id}>
                  {inviteType === 'email' && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      {invitation.email}
                    </td>
                  )}
                  {inviteType === 'social' && (
                    <>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {invitation.socialProvider === 'twitter' ? 'Twitter/X' : invitation.socialProvider}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        @{invitation.socialHandle}
                      </td>
                    </>
                  )}
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {formatDate(invitation.createdAt)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {invitation.used ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Used
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {!invitation.used && (
                      <button
                        onClick={() => handleRevokeInvitation(invitation.id)}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        disabled={revokingInvitation === invitation.id}
                        title="Revoke Invitation"
                      >
                        {revokingInvitation === invitation.id ? (
                          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    )}
                    {invitation.used && invitation.usedBy && (
                      <span className="text-sm text-gray-500" title={`Used by ${invitation.usedBy.name || invitation.usedBy.email}`}>
                        Used
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Guild Invitations</h2>
            <button
              onClick={() => setShowInviteModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Reordered Tabs: Open, Email, Social Media */}
          <div className="flex border-b mb-6 overflow-x-auto">
            <button
              type="button"
              className={`py-2 px-4 whitespace-nowrap ${inviteType === 'open' ? 'text-primary-600 border-b-2 border-primary-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => handleTabChange('open')}
            >
              Open Invitation
            </button>
            <button
              type="button"
              className={`py-2 px-4 whitespace-nowrap ${inviteType === 'email' ? 'text-primary-600 border-b-2 border-primary-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => handleTabChange('email')}
            >
              Invite by Email
            </button>
            <button
              type="button"
              className={`py-2 px-4 whitespace-nowrap ${inviteType === 'social' ? 'text-primary-600 border-b-2 border-primary-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => handleTabChange('social')}
            >
              Invite by Social Media
            </button>
          </div>
          
          {/* Form for creating the selected invitation type */}
          {renderInvitationForm()}
          
          {/* List of existing invitations */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-3">{inviteType === 'open' ? 'Open' : inviteType === 'email' ? 'Email' : 'Social Media'} Invitations</h3>
            {renderInvitationsList()}
          </div>
        </div>
      </div>
    );
  };
  
  // Edit Guild Modal
  const EditModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit Guild</h2>
        
        <form onSubmit={handleUpdateGuild}>
          <div className="mb-4">
            <label htmlFor="editName" className="block text-sm font-medium text-gray-700 mb-1">
              Guild Name <span className="text-red-500">*</span>
            </label>
            <input
              id="editName"
              type="text"
              className="input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Enter guild name"
              required
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              {editName.length}/50 characters
            </p>
          </div>
          
          <div className="mb-4">
            <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="editDescription"
              rows="4"
              className="input"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Describe your guild's purpose and goals"
              maxLength={500}
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">
              {editDescription.length}/500 characters
            </p>
          </div>
          
          <div className="mb-4">
            <label htmlFor="editIconUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Icon URL
            </label>
            <input
              id="editIconUrl"
              type="url"
              className="input"
              value={editIconUrl}
              onChange={(e) => setEditIconUrl(e.target.value)}
              placeholder="https://example.com/icon.png"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={editLoading || !editName.trim()}
            >
              {editLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  
  // Change Role Modal
  const ChangeRoleModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Change Member Role</h2>
        
        {selectedMember && (
          <form onSubmit={handleChangeRole}>
            <div className="mb-6">
              <p className="mb-2">
                Change role for <span className="font-medium">{selectedMember.name}</span>
              </p>
              
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="member"
                    checked={newRole === 'member'}
                    onChange={() => setNewRole('member')}
                    className="mr-2"
                  />
                  <span>Member</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={newRole === 'admin'}
                    onChange={() => setNewRole('admin')}
                    className="mr-2"
                  />
                  <span>Admin</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={roleLoading || newRole === selectedMember.role}
              >
                {roleLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
  
  return (
    <div>
      <div className="mb-6">
        <Link to="/guilds" className="text-primary-600 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Guilds
        </Link>
      </div>
      
      <GuildHeader />
      <GuildActions />
      <MembersSection />
      <BadgesSection />
      
      {/* Modals */}
      {showInviteModal && <InviteModal />}
      {showEditModal && <EditModal />}
      {showRoleModal && <ChangeRoleModal />}
    </div>
  );
};

export default GuildDetailPage;