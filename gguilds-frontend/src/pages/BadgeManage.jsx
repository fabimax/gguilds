// src/pages/BadgeManage.jsx
// Badge management page - a page for managing user badges and creating/issuing guild badges
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const BadgeManage = () => {
  const { user } = useAuth();
  
  // State for badges
  const [userBadges, setUserBadges] = useState([]);
  const [guildBadges, setGuildBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [isCreatingBadge, setIsCreatingBadge] = useState(false);
  
  // New badge form state
  const [badgeName, setBadgeName] = useState('');
  const [badgeDescription, setBadgeDescription] = useState('');
  const [badgeColor, setBadgeColor] = useState('#4F46E5');
  const [badgeIcon, setBadgeIcon] = useState('trophy');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch badges
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, this would be an API call
        // For now, we'll use mock data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock user badges
        const mockUserBadges = [
          {
            id: 'ub1',
            name: 'JavaScript Expert',
            description: 'Awarded for JavaScript expertise',
            issuer: 'Web Developers Guild',
            issuedDate: '2024-01-15',
            imageUrl: 'https://via.placeholder.com/60',
            isDisplayed: true
          },
          {
            id: 'ub2',
            name: 'Community Contributor',
            description: 'For valuable contributions to the community',
            issuer: 'GoodGuilds',
            issuedDate: '2024-02-10',
            imageUrl: 'https://via.placeholder.com/60',
            isDisplayed: true
          },
          {
            id: 'ub3',
            name: 'UI Design Award',
            description: 'Recognizing excellent UI design skills',
            issuer: 'Digital Artists Collective',
            issuedDate: '2024-02-28',
            imageUrl: 'https://via.placeholder.com/60',
            isDisplayed: false
          }
        ];
        
        // Mock guild badges (badges you can issue as a guild admin/owner)
        const mockGuildBadges = [
          {
            id: 'gb1',
            name: 'Web Dev Contributor',
            description: 'For members who contribute to guild projects',
            guild: 'Web Developers Guild',
            createdDate: '2023-12-10',
            imageUrl: 'https://via.placeholder.com/60',
            issuedCount: 15
          },
          {
            id: 'gb2',
            name: 'Web Dev Mentor',
            description: 'Recognizes members who help others learn',
            guild: 'Web Developers Guild',
            createdDate: '2024-01-05',
            imageUrl: 'https://via.placeholder.com/60',
            issuedCount: 7
          }
        ];
        
        setUserBadges(mockUserBadges);
        setGuildBadges(mockGuildBadges);
        
      } catch (error) {
        console.error('Error fetching badges:', error);
        setError('Failed to load badges. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBadges();
  }, []);
  
  // Toggle badge display
  const toggleBadgeDisplay = async (badgeId) => {
    try {
      // In a real app, this would be an API call
      
      // Update the UI optimistically
      setUserBadges(userBadges.map(badge => 
        badge.id === badgeId 
          ? { ...badge, isDisplayed: !badge.isDisplayed } 
          : badge
      ));
      
    } catch (error) {
      console.error('Error toggling badge display:', error);
      // Revert the UI change
      setUserBadges([...userBadges]);
      alert('Failed to update badge display. Please try again.');
    }
  };
  
  // Handle badge creation
  const handleCreateBadge = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // In a real app, this would be an API call
      // For now, we'll simulate creating a badge
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate new mock badge
      const newBadge = {
        id: `gb${Date.now()}`,
        name: badgeName,
        description: badgeDescription,
        guild: 'Web Developers Guild',
        createdDate: new Date().toISOString(),
        imageUrl: 'https://via.placeholder.com/60',
        issuedCount: 0
      };
      
      // Update guild badges list
      setGuildBadges([newBadge, ...guildBadges]);
      
      // Close the modal and reset form
      setIsCreatingBadge(false);
      setBadgeName('');
      setBadgeDescription('');
      setBadgeColor('#4F46E5');
      setBadgeIcon('trophy');
      
    } catch (error) {
      console.error('Error creating badge:', error);
      alert('Failed to create badge. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading badges...</div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Badge Management</h1>
      
      {/* Display error if any */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* My Badges Section */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">My Badges</h2>
        <p className="text-gray-600 mb-4">Manage how your earned badges appear on your profile.</p>
        
        {userBadges.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>You haven't earned any badges yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userBadges.map(badge => (
              <div key={badge.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <img 
                    src={badge.imageUrl} 
                    alt={badge.name} 
                    className="w-12 h-12 mr-3"
                  />
                  <div>
                    <h3 className="font-medium">{badge.name}</h3>
                    <div className="text-sm text-gray-500">From {badge.issuer}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Earned: {new Date(badge.issuedDate).toLocaleDateString()}
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <span className="text-sm mr-2">Display</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={badge.isDisplayed}
                        onChange={() => toggleBadgeDisplay(badge.id)}
                        className="sr-only"
                      />
                      <div className={`block w-10 h-6 rounded-full ${badge.isDisplayed ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${badge.isDisplayed ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* Guild Badges Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Guild Badges</h2>
          <button
            onClick={() => setIsCreatingBadge(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Create Badge
          </button>
        </div>
        <p className="text-gray-600 mb-4">Manage badges for guilds you administer.</p>
        
        {guildBadges.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>You haven't created any guild badges yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guildBadges.map(badge => (
              <div key={badge.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <img 
                    src={badge.imageUrl} 
                    alt={badge.name} 
                    className="w-12 h-12 mr-3"
                  />
                  <div>
                    <h3 className="font-medium">{badge.name}</h3>
                    <div className="text-sm text-gray-500">{badge.guild}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Awarded to {badge.issuedCount} member{badge.issuedCount !== 1 ? 's' : ''}
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:underline text-sm">
                      Issue
                    </button>
                    <button className="text-blue-600 hover:underline text-sm">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* Create Badge Modal */}
      {isCreatingBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create New Badge</h2>
            
            <form onSubmit={handleCreateBadge}>
              {/* Badge Name */}
              <div className="mb-4">
                <label htmlFor="badgeName" className="block text-sm font-medium text-gray-700 mb-1">
                  Badge Name
                </label>
                <input
                  id="badgeName"
                  type="text"
                  value={badgeName}
                  onChange={(e) => setBadgeName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              {/* Badge Description */}
              <div className="mb-4">
                <label htmlFor="badgeDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="badgeDescription"
                  value={badgeDescription}
                  onChange={(e) => setBadgeDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  disabled={isSubmitting}
                  required
                ></textarea>
              </div>
              
              {/* Badge Appearance */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Badge Appearance
                </label>
                <div className="flex space-x-4">
                  {/* Color Picker */}
                  <div>
                    <label htmlFor="badgeColor" className="block text-xs text-gray-500 mb-1">
                      Color
                    </label>
                    <input
                      id="badgeColor"
                      type="color"
                      value={badgeColor}
                      onChange={(e) => setBadgeColor(e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  {/* Icon Selector */}
                  <div className="flex-1">
                    <label htmlFor="badgeIcon" className="block text-xs text-gray-500 mb-1">
                      Icon
                    </label>
                    <select
                      id="badgeIcon"
                      value={badgeIcon}
                      onChange={(e) => setBadgeIcon(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      disabled={isSubmitting}
                    >
                      <option value="trophy">Trophy</option>
                      <option value="star">Star</option>
                      <option value="medal">Medal</option>
                      <option value="certificate">Certificate</option>
                      <option value="code">Code</option>
                      <option value="brush">Brush</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Badge Preview */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded-md">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: badgeColor }}
                  >
                    <span className="text-white text-2xl">
                      {badgeIcon === 'trophy' && '🏆'}
                      {badgeIcon === 'star' && '⭐'}
                      {badgeIcon === 'medal' && '🏅'}
                      {badgeIcon === 'certificate' && '📜'}
                      {badgeIcon === 'code' && '👨‍💻'}
                      {badgeIcon === 'brush' && '🎨'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Modal Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingBadge(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Badge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeManage;