// src/pages/GuildManage.jsx
// Guild management page - an admin interface for managing guild settings, members, roles, and applications
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const GuildManage = () => {
  const { guildId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // State for guild data
  const [guild, setGuild] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for active management tab
  const [activeTab, setActiveTab] = useState('general');
  
  // Fetch guild data
  useEffect(() => {
    const fetchGuildData = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, these would be API calls to fetch guild data
        // For now, we'll use mock data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock guild data
        const mockGuild = {
          id: guildId,
          name: 'Web Developers Guild',
          description: 'A community of web developers sharing knowledge and helping each other grow in their careers.',
          avatarUrl: 'https://via.placeholder.com/150',
          bannerUrl: 'https://via.placeholder.com/1200x300',
          isPublic: true,
          tags: ['Technology', 'Development', 'Education'],
          roles: [
            { id: 'r1', name: 'Admin', permissions: ['manage_guild', 'manage_members', 'manage_roles'] },
            { id: 'r2', name: 'Moderator', permissions: ['manage_members'] },
            { id: 'r3', name: 'Member', permissions: [] }
          ]
        };
        
        // Mock members data
        const mockMembers = [
          {
            id: 'u1',
            name: 'Jane Smith',
            avatarUrl: 'https://via.placeholder.com/50',
            role: 'Admin',
            tier: 'S',
            joinedAt: '2023-11-15T10:30:00Z'
          },
          {
            id: 'u2',
            name: 'John Doe',
            avatarUrl: 'https://via.placeholder.com/50',
            role: 'Moderator',
            tier: 'A',
            joinedAt: '2023-11-20T15:45:00Z'
          },
          {
            id: 'u3',
            name: 'Alice Johnson',
            avatarUrl: 'https://via.placeholder.com/50',
            role: 'Member',
            tier: 'B',
            joinedAt: '2023-12-05T09:15:00Z'
          }
        ];
        
        // Set state with mock data
        setGuild(mockGuild);
        setMembers(mockMembers);
        
      } catch (error) {
        console.error('Error fetching guild data:', error);
        setError('Failed to load guild information.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGuildData();
  }, [guildId]);
  
  // Handle saving general settings
  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    // This would save the guild's general settings to the backend
    alert('Guild settings saved (mock)');
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading guild management...</div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button 
          onClick={() => navigate(`/guilds/${guildId}`)} 
          className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Back to Guild
        </button>
      </div>
    );
  }
  
  // Render not found state
  if (!guild) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Guild Not Found</h2>
        <p className="mb-4">The guild you're looking for doesn't exist or has been removed.</p>
        <Link 
          to="/dashboard" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage {guild.name}</h1>
        <Link
          to={`/guilds/${guildId}`}
          className="text-blue-600 hover:underline"
        >
          Back to Guild
        </Link>
      </div>
      
      {/* Management Tabs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="flex border-b">
          <button
            className={`px-4 py-3 ${activeTab === 'general' ? 'border-b-2 border-blue-600 font-medium text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab('general')}
          >
            General Settings
          </button>
          <button
            className={`px-4 py-3 ${activeTab === 'members' ? 'border-b-2 border-blue-600 font-medium text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab('members')}
          >
            Members
          </button>
          <button
            className={`px-4 py-3 ${activeTab === 'roles' ? 'border-b-2 border-blue-600 font-medium text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab('roles')}
          >
            Roles
          </button>
          <button
            className={`px-4 py-3 ${activeTab === 'applications' ? 'border-b-2 border-blue-600 font-medium text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab('applications')}
          >
            Applications
          </button>
        </div>
        
        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Guild Settings</h2>
            
            <form onSubmit={handleSaveGeneral}>
              {/* Guild Name */}
              <div className="mb-4">
                <label htmlFor="guildName" className="block text-sm font-medium text-gray-700 mb-1">
                  Guild Name
                </label>
                <input
                  id="guildName"
                  type="text"
                  defaultValue={guild.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              {/* Guild Description */}
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  defaultValue={guild.description}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={4}
                ></textarea>
              </div>
              
              {/* Guild Privacy */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Privacy Setting
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="privacy"
                      defaultChecked={guild.isPublic}
                      className="mr-2"
                    />
                    <div>
                      <div className="font-medium">Public</div>
                      <div className="text-sm text-gray-500">Anyone can find and request to join your guild</div>
                    </div>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="privacy"
                      defaultChecked={!guild.isPublic}
                      className="mr-2"
                    />
                    <div>
                      <div className="font-medium">Private</div>
                      <div className="text-sm text-gray-500">Only people with a direct link can find your guild</div>
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Guild Members</h2>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                Invite Member
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Member</th>
                    <th className="px-4 py-2 text-left">Role</th>
                    <th className="px-4 py-2 text-left">Tier</th>
                    <th className="px-4 py-2 text-left">Joined</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(member => (
                    <tr key={member.id} className="border-t border-gray-200">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <img 
                            src={member.avatarUrl} 
                            alt={member.name} 
                            className="w-8 h-8 rounded-full mr-2"
                          />
                          <span>{member.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                          <option selected={member.role === 'Admin'}>Admin</option>
                          <option selected={member.role === 'Moderator'}>Moderator</option>
                          <option selected={member.role === 'Member'}>Member</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                          <option selected={member.tier === 'S'}>S</option>
                          <option selected={member.tier === 'A'}>A</option>
                          <option selected={member.tier === 'B'}>B</option>
                          <option selected={member.tier === 'C'}>C</option>
                          <option selected={member.tier === 'D'}>D</option>
                          <option selected={member.tier === 'E'}>E</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-red-600 hover:underline text-sm">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Guild Roles</h2>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                Add Role
              </button>
            </div>
            
            <div className="space-y-4">
              {guild.roles.map(role => (
                <div key={role.id} className="border border-gray-200 rounded-md p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">{role.name}</div>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:underline text-sm">
                        Edit
                      </button>
                      {role.name !== 'Admin' && role.name !== 'Member' && (
                        <button className="text-red-600 hover:underline text-sm">
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <div className="mb-1">Permissions:</div>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.length > 0 ? (
                        role.permissions.map((perm, index) => (
                          <span key={index} className="bg-gray-100 px-2 py-0.5 rounded">
                            {perm.replace('_', ' ')}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">No special permissions</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Membership Applications</h2>
            
            <div className="text-center py-8 text-gray-500">
              <p>No pending applications at this time.</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-red-200">
        <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
        <p className="text-gray-600 mb-4">These actions are destructive and cannot be reversed. Please proceed with caution.</p>
        
        <div className="space-y-3">
          <button className="block w-full text-left px-4 py-2 border border-red-300 rounded hover:bg-red-50 text-red-600">
            Transfer Guild Ownership
          </button>
          <button className="block w-full text-left px-4 py-2 border border-red-300 rounded hover:bg-red-50 text-red-600">
            Delete Guild
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuildManage;