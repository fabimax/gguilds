/**
 * Badge Detail Page component
 * Shows detailed information about a specific badge
 * Allows badge creators to manage the badge and its assignments
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '@/stores/authStore';
import useAuthStore from '@/stores/authStore';

const BadgeDetailPage = () => {
  const { badgeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [badge, setBadge] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  
  // States for badge recipients
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignType, setAssignType] = useState('user');
  const [assignToId, setAssignToId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  
  // States for assigned entities
  const [showRecipientsModal, setShowRecipientsModal] = useState(false);
  const [recipientsType, setRecipientsType] = useState('users');
  const [recipients, setRecipients] = useState([]);
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  
  // States for editing
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIconUrl, setEditIconUrl] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  
  // Fetch badge data
  useEffect(() => {
    const fetchBadgeData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/badges/${badgeId}`);
        
        setBadge(response.data.badge);
        
        // Check if current user is the creator
        if (user && response.data.badge.created_by === user.id) {
          setIsCreator(true);
        }
        
        // Initialize edit form with current values
        setEditName(response.data.badge.name);
        setEditDescription(response.data.badge.description || '');
        setEditIconUrl(response.data.badge.icon_url || '');
      } catch (error) {
        console.error('Failed to fetch badge data:', error);
        toast.error('Failed to load badge');
        navigate('/badges');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBadgeData();
  }, [badgeId, navigate, user]);
  
  // Fetch badge recipients (users or guilds)
  const fetchRecipients = async (type) => {
    try {
      setRecipientsLoading(true);
      setRecipientsType(type);
      
      const endpoint = type === 'users' 
        ? `/badges/${badgeId}/users` 
        : `/badges/${badgeId}/guilds`;
      
      const response = await api.get(endpoint);
      
      setRecipients(response.data[type]);
      setShowRecipientsModal(true);
    } catch (error) {
      console.error(`Failed to fetch badge ${type}:`, error);
      toast.error(`Failed to load badge ${type}`);
    } finally {
      setRecipientsLoading(false);
    }
  };
  
  // Assign badge to user or guild
  const handleAssignBadge = async (e) => {
    e.preventDefault();
    
    if (!assignToId.trim()) {
      toast.error(`Please enter a ${assignType} ID`);
      return;
    }
    
    try {
      setAssignLoading(true);
      
      const endpoint = assignType === 'user' 
        ? `/badges/${badgeId}/assign-to-user` 
        : `/badges/${badgeId}/assign-to-guild`;
      
      const data = assignType === 'user' 
        ? { userId: assignToId } 
        : { guildId: assignToId };
      
      await api.post(endpoint, data);
      
      toast.success(`Badge assigned to ${assignType} successfully`);
      setAssignToId('');
      setShowAssignModal(false);
    } catch (error) {
      console.error('Failed to assign badge:', error);
      toast.error(error.response?.data?.message || 'Failed to assign badge');
    } finally {
      setAssignLoading(false);
    }
  };
  
  // Revoke badge from user or guild
  const handleRevokeBadge = async (type, id) => {
    if (!confirm(`Are you sure you want to revoke this badge from this ${type === 'users' ? 'user' : 'guild'}?`)) {
      return;
    }
    
    try {
      const endpoint = type === 'users' 
        ? `/badges/${badgeId}/users/${id}`
        : `/badges/${badgeId}/guilds/${id}`;
      
      await api.delete(endpoint);
      
      // Remove from state immediately for responsiveness
      setRecipients(recipients.filter(recipient => recipient.id !== id));
      toast.success(`Badge revoked successfully`);
    } catch (error) {
      console.error('Failed to revoke badge:', error);
      toast.error('Failed to revoke badge');
    }
  };
  
  // Update badge
  const handleUpdateBadge = async (e) => {
    e.preventDefault();
    
    if (!editName.trim()) {
      toast.error('Badge name is required');
      return;
    }
    
    try {
      setEditLoading(true);
      
      const response = await api.put(`/badges/${badgeId}`, {
        name: editName,
        description: editDescription,
        icon_url: editIconUrl
      });
      
      setBadge(response.data.badge);
      setShowEditModal(false);
      toast.success('Badge updated successfully');
    } catch (error) {
      console.error('Failed to update badge:', error);
      toast.error(error.response?.data?.message || 'Failed to update badge');
    } finally {
      setEditLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!badge) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Badge not found</h2>
        <Link to="/badges" className="btn btn-primary">
          Back to Badges
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <Link to="/badges" className="text-primary-600 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Badges
        </Link>
      </div>
      
      {/* Badge display */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row items-center p-6">
          <div className="md:w-1/3 flex justify-center mb-6 md:mb-0">
            {badge.icon_url ? (
              <img
                src={badge.icon_url}
                alt={badge.name}
                className="w-48 h-48 object-contain"
              />
            ) : (
              <div className="w-48 h-48 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-bold text-5xl">
                  {badge.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          <div className="md:w-2/3 md:pl-8">
            <h1 className="text-3xl font-bold mb-4">{badge.name}</h1>
            
            {badge.description && (
              <p className="text-gray-700 mb-6">{badge.description}</p>
            )}
            
            <div className="flex items-center text-sm text-gray-500 mb-6">
              <span>Created: {new Date(badge.created_at).toLocaleDateString()}</span>
              
              {badge.creator && (
                <div className="flex items-center ml-6">
                  <span>By: </span>
                  <div className="flex items-center ml-1">
                    {badge.creator.avatar_url ? (
                      <img
                        src={badge.creator.avatar_url}
                        alt={badge.creator.name}
                        className="w-5 h-5 rounded-full mr-1"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center mr-1">
                        <span className="text-gray-600 text-xs">
                          {badge.creator.name ? badge.creator.name.charAt(0) : '?'}
                        </span>
                      </div>
                    )}
                    <span>{badge.creator.name || 'Unknown creator'}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Actions for badge creator */}
            {isCreator && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="btn btn-primary"
                >
                  Edit Badge
                </button>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="btn btn-primary"
                >
                  Assign Badge
                </button>
                <button
                  onClick={() => fetchRecipients('users')}
                  className="btn btn-outline"
                >
                  View Users
                </button>
                <button
                  onClick={() => fetchRecipients('guilds')}
                  className="btn btn-outline"
                >
                  View Guilds
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Edit Badge Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Badge</h2>
            
            <form onSubmit={handleUpdateBadge}>
              <div className="mb-4">
                <label htmlFor="editName" className="block text-sm font-medium text-gray-700 mb-1">
                  Badge Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="editName"
                  type="text"
                  className="input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter badge name"
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
                  placeholder="Describe what this badge represents"
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
      )}
      
      {/* Assign Badge Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Assign Badge</h2>
            
            <div className="flex border-b mb-4">
              <button
                type="button"
                className={`py-2 px-4 ${assignType === 'user' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
                onClick={() => setAssignType('user')}
              >
                Assign to User
              </button>
              <button
                type="button"
                className={`py-2 px-4 ${assignType === 'guild' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
                onClick={() => setAssignType('guild')}
              >
                Assign to Guild
              </button>
            </div>
            
            <form onSubmit={handleAssignBadge}>
              <div className="mb-4">
                <label htmlFor="assignToId" className="block text-sm font-medium text-gray-700 mb-1">
                  {assignType === 'user' ? 'User ID' : 'Guild ID'} <span className="text-red-500">*</span>
                </label>
                <input
                  id="assignToId"
                  type="text"
                  className="input"
                  value={assignToId}
                  onChange={(e) => setAssignToId(e.target.value)}
                  placeholder={assignType === 'user' ? 'Enter user ID' : 'Enter guild ID'}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the UUID of the {assignType} you want to assign this badge to
                </p>
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={assignLoading || !assignToId.trim()}
                >
                  {assignLoading ? 'Assigning...' : 'Assign Badge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Recipients Modal (Users or Guilds) */}
      {showRecipientsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {recipientsType === 'users' ? 'Users with this Badge' : 'Guilds with this Badge'}
              </h2>
              <button
                onClick={() => setShowRecipientsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {recipientsLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-12 h-12 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
              </div>
            ) : recipients.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded">
                <p className="text-gray-500">
                  No {recipientsType} have this badge yet
                </p>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-96 border rounded">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {recipientsType === 'users' ? (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                        </>
                      ) : (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Guild
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                        </>
                      )}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recipients.map((recipient) => (
                      <tr key={recipient.id}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            {recipient.avatar_url || recipient.icon_url ? (
                              <img
                                src={recipient.avatar_url || recipient.icon_url}
                                alt={recipient.name}
                                className="w-8 h-8 rounded-full mr-3"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                <span className="text-gray-600 font-medium">
                                  {recipient.name ? recipient.name.charAt(0) : 'U'}
                                </span>
                              </div>
                            )}
                            <span className="font-medium">{recipient.name || 'Unnamed'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {recipientsType === 'users' ? (
                            <span className="text-gray-500">{recipient.email || 'No email'}</span>
                          ) : (
                            <span className="text-gray-500 truncate max-w-xs inline-block">
                              {recipient.description || 'No description'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {new Date(recipient.assigned_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => handleRevokeBadge(recipientsType, recipient.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Revoke Badge"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeDetailPage;