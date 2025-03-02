// src/pages/UserProfile.js
// A profile page for viewing and editing user information
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const UserProfile = () => {
  const { user } = useAuth();
  
  // State variables
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [userBadges, setUserBadges] = useState([]);
  const [userGuilds, setUserGuilds] = useState([]);
  
  // Load user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, this would be an API call
        // For now, we'll simulate loading user profile data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock user profile data
        setDisplayName(user?.name || 'User');
        setBio('Web developer and designer passionate about creating intuitive user experiences.');
        setAvatarPreview(user?.avatarUrl || 'https://via.placeholder.com/150');
        
        // Mock linked accounts
        setLinkedAccounts([
          { provider: 'twitter', username: 'twitteruser', isConnected: true },
          { provider: 'google', email: user?.email, isConnected: true },
          { provider: 'discord', username: 'discorduser#1234', isConnected: false },
          { provider: 'twitch', username: 'twitchuser', isConnected: false }
        ]);
        
        // Mock user badges
        setUserBadges([
          {
            id: 'b1',
            name: 'JavaScript Expert',
            description: 'Awarded for JavaScript expertise',
            issuer: 'Web Developers Guild',
            issuedDate: '2024-01-15',
            imageUrl: 'https://via.placeholder.com/60'
          },
          {
            id: 'b2',
            name: 'Community Contributor',
            description: 'For valuable contributions to the community',
            issuer: 'GoodGuilds',
            issuedDate: '2024-02-10',
            imageUrl: 'https://via.placeholder.com/60'
          },
          {
            id: 'b3',
            name: 'UI Design Award',
            description: 'Recognizing excellent UI design skills',
            issuer: 'Digital Artists Collective',
            issuedDate: '2024-02-28',
            imageUrl: 'https://via.placeholder.com/60'
          }
        ]);
        
        // Mock user guilds
        setUserGuilds([
          {
            id: 'g1',
            name: 'Web Developers Guild',
            role: 'Admin',
            tier: 'S',
            avatarUrl: 'https://via.placeholder.com/40'
          },
          {
            id: 'g2',
            name: 'Digital Artists Collective',
            role: 'Member',
            tier: 'A',
            avatarUrl: 'https://via.placeholder.com/40'
          }
        ]);
        
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load user profile.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [user]);
  
  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      // In a real app, this would be an API call to update the profile
      // For now, we'll simulate saving the profile
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Exit editing mode
      setIsEditing(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Connect a social account
  const handleConnectAccount = async (provider) => {
    try {
      // In a real app, this would redirect to OAuth flow
      console.log(`Connecting ${provider} account...`);
      
      // Simulate connecting account
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update linked accounts
      setLinkedAccounts(
        linkedAccounts.map(account => 
          account.provider === provider 
            ? { ...account, isConnected: true } 
            : account
        )
      );
      
    } catch (error) {
      console.error(`Error connecting ${provider} account:`, error);
      setError(`Failed to connect ${provider} account. Please try again.`);
    }
  };
  
  // Disconnect a social account
  const handleDisconnectAccount = async (provider) => {
    try {
      // In a real app, this would make an API call
      console.log(`Disconnecting ${provider} account...`);
      
      // Simulate disconnecting account
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update linked accounts
      setLinkedAccounts(
        linkedAccounts.map(account => 
          account.provider === provider 
            ? { ...account, isConnected: false } 
            : account
        )
      );
      
    } catch (error) {
      console.error(`Error disconnecting ${provider} account:`, error);
      setError(`Failed to disconnect ${provider} account. Please try again.`);
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Display errors if any */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Profile Information Section */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold">Your Profile</h1>
          
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Edit Profile
            </button>
          )}
        </div>
        
        {isEditing ? (
          // Edit Profile Form
          <form onSubmit={handleSubmit}>
            {/* Avatar Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Photo
              </label>
              <div className="flex items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden mr-4">
                  <img 
                    src={avatarPreview} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <input
                    type="file"
                    id="avatar"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="avatar"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded cursor-pointer block text-center"
                  >
                    Change Photo
                  </label>
                </div>
              </div>
            </div>
            
            {/* Display Name */}
            <div className="mb-4">
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={isSaving}
              />
            </div>
            
            {/* Bio */}
            <div className="mb-6">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
                maxLength={250}
                disabled={isSaving}
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">
                {bio.length}/250 characters
              </p>
            </div>
            
            {/* Form Actions */}
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded"
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          // Display Profile
          <div>
            <div className="flex items-start mb-6">
              <img 
                src={avatarPreview} 
                alt="Profile" 
                className="w-24 h-24 rounded-full mr-6"
              />
              <div>
                <h2 className="text-xl font-semibold mb-1">{displayName}</h2>
                <p className="text-gray-600 mb-2">{user?.email}</p>
                <p>{bio}</p>
              </div>
            </div>
          </div>
        )}
      </section>
      
      {/* Connected Accounts Section */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Connected Accounts</h2>
        
        <ul className="space-y-4">
          {linkedAccounts.map(account => (
            <li key={account.provider} className="flex justify-between items-center">
              <div className="flex items-center">
                {/* Provider Icon */}
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  {account.provider === 'twitter' && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                    </svg>
                  )}
                  {account.provider === 'google' && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  {account.provider === 'discord' && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#5865F2">
                      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3847-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                    </svg>
                  )}
                  {account.provider === 'twitch' && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#9146FF">
                      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                    </svg>
                  )}
                </div>
                
                <div>
                  <div className="font-medium">
                    {account.provider.charAt(0).toUpperCase() + account.provider.slice(1)}
                  </div>
                  {account.isConnected && (
                    <div className="text-sm text-gray-600">
                      {account.username || account.email}
                    </div>
                  )}
                </div>
              </div>
              
              {account.isConnected ? (
                <button
                  onClick={() => handleDisconnectAccount(account.provider)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => handleConnectAccount(account.provider)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Connect
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
      
      {/* Badges Section */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Badges</h2>
          <Link 
            to="/badges/manage" 
            className="text-sm text-blue-600 hover:underline"
          >
            Manage Badges
          </Link>
        </div>
        
        {userBadges.length === 0 ? (
          <p className="text-gray-600">You haven't earned any badges yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {userBadges.map(badge => (
              <div key={badge.id} className="text-center">
                <img 
                  src={badge.imageUrl} 
                  alt={badge.name} 
                  className="w-16 h-16 mx-auto mb-2"
                />
                <div className="font-medium text-sm">{badge.name}</div>
                <div className="text-xs text-gray-500">From: {badge.issuer}</div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* Guilds Section */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Guilds</h2>
          <Link 
            to="/guilds/discover" 
            className="text-sm text-blue-600 hover:underline"
          >
            Find Guilds
          </Link>
        </div>
        
        {userGuilds.length === 0 ? (
          <p className="text-gray-600">You haven't joined any guilds yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {userGuilds.map(guild => (
              <li key={guild.id} className="py-3 flex justify-between items-center">
                <div className="flex items-center">
                  <img 
                    src={guild.avatarUrl} 
                    alt={guild.name} 
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <div className="font-medium">{guild.name}</div>
                    <div className="flex space-x-2 text-sm">
                      <span className="text-blue-600">{guild.role}</span>
                      <span className="text-purple-600">Tier {guild.tier}</span>
                    </div>
                  </div>
                </div>
                <Link 
                  to={`/guilds/${guild.id}`} 
                  className="text-blue-600 hover:underline"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default UserProfile;