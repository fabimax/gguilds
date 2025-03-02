// src/pages/GuildProfile.js
// A profile page for Guild profiles
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const GuildDetail = () => {
  const { guildId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // State for guild data
  const [guild, setGuild] = useState(null);
  const [members, setMembers] = useState([]);
  const [badges, setBadges] = useState([]);
  const [activities, setActivities] = useState([]);
  const [userMembership, setUserMembership] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Application state
  const [isApplying, setIsApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
          description: 'A community of web developers sharing knowledge and helping each other grow in their careers. We focus on frontend and backend technologies, best practices, and career development.',
          avatarUrl: 'https://via.placeholder.com/150',
          bannerUrl: 'https://via.placeholder.com/1200x300',
          createdAt: '2023-11-15T10:30:00Z',
          memberCount: 42,
          tags: ['Technology', 'Development', 'Education'],
          isPublic: true,
          requirements: [
            { type: 'badge', name: 'JavaScript Basics', required: true },
            { type: 'approval', description: 'Admin approval required', required: true }
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
            role: 'Recruiter',
            tier: 'A',
            joinedAt: '2023-11-20T15:45:00Z'
          },
          // More members...
          {
            id: 'u3',
            name: 'Alice Johnson',
            avatarUrl: 'https://via.placeholder.com/50',
            role: 'Member',
            tier: 'B',
            joinedAt: '2023-12-05T09:15:00Z'
          },
          {
            id: 'u4',
            name: 'Bob Wilson',
            avatarUrl: 'https://via.placeholder.com/50',
            role: 'Member',
            tier: 'C',
            joinedAt: '2024-01-10T14:20:00Z'
          }
        ];
        
        // Mock badges data
        const mockBadges = [
          {
            id: 'b1',
            name: 'JavaScript Expert',
            description: 'Awarded to members who demonstrate advanced JavaScript knowledge',
            imageUrl: 'https://via.placeholder.com/60',
            earnedCount: 15
          },
          {
            id: 'b2',
            name: 'Community Helper',
            description: 'Recognizes members who actively help others in the community',
            imageUrl: 'https://via.placeholder.com/60',
            earnedCount: 28
          },
          {
            id: 'b3',
            name: 'Project Contributor',
            description: 'For members who contribute to guild projects',
            imageUrl: 'https://via.placeholder.com/60',
            earnedCount: 10
          }
        ];
        
        // Mock activities data
        const mockActivities = [
          {
            id: 'a1',
            title: 'Weekly Code Review',
            description: 'Members share their code and receive feedback',
            date: '2024-03-05T18:00:00Z',
            participantCount: 12
          },
          {
            id: 'a2',
            title: 'React Workshop',
            description: 'Learn advanced React techniques and patterns',
            date: '2024-03-10T15:00:00Z',
            participantCount: 24
          }
        ];
        
        // Check if user is a member of this guild
        if (isAuthenticated && user) {
          // In a real app, this would be determined from the API response
          // For now, let's assume the user is not a member
          const isMember = false;
          
          if (isMember) {
            setUserMembership({
              role: 'Member',
              tier: 'D',
              joinedAt: '2024-02-15T11:30:00Z'
            });
          } else {
            setUserMembership(null);
          }
        }
        
        // Set state with mock data
        setGuild(mockGuild);
        setMembers(mockMembers);
        setBadges(mockBadges);
        setActivities(mockActivities);
        
      } catch (error) {
        console.error('Error fetching guild data:', error);
        setError('Failed to load guild information. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGuildData();
  }, [guildId, isAuthenticated, user]);
  
  // Handle apply to join
  const handleApply = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // In a real app, this would be an API call to submit application
      // For now, we'll simulate an API call
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset application form and show success message
      setIsApplying(false);
      setApplicationMessage('');
      
      // Show success message (in a real app, you would use a toast notification)
      alert('Your application has been submitted successfully!');
      
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading guild information...</div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button 
          onClick={() => navigate(-1)} 
          className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Go Back
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
      {/* Guild Banner & Info Section */}
      <section className="relative mb-8">
        {/* Banner */}
        <div className="h-48 bg-blue-600 rounded-t-lg overflow-hidden">
          {guild.bannerUrl && (
            <img 
              src={guild.bannerUrl} 
              alt={`${guild.name} banner`} 
              className="w-full h-full object-cover"
            />
          )}
        </div>
        
        {/* Guild Info Card */}
        <div className="bg-white rounded-b-lg shadow-md p-6 relative">
          {/* Guild Avatar */}
          <div className="absolute -top-12 left-6 w-24 h-24 rounded-full overflow-hidden border-4 border-white">
            <img 
              src={guild.avatarUrl} 
              alt={guild.name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Guild Header */}
          <div className="ml-28 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{guild.name}</h1>
              <div className="flex flex-wrap space-x-2 mt-1">
                {guild.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              {isAuthenticated && (
                <>
                  {userMembership ? (
                    <Link 
                      to={`/guilds/${guild.id}/activity`} 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                      View Activity
                    </Link>
                  ) : (
                    <button
                      onClick={() => setIsApplying(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                      Apply to Join
                    </button>
                  )}
                </>
              )}
              
              {userMembership?.role === 'Admin' && (
                <Link 
                  to={`/guilds/${guild.id}/manage`} 
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
                >
                  Manage Guild
                </Link>
              )}
            </div>
          </div>
          
          {/* Guild Stats */}
          <div className="flex space-x-6 mt-4 text-gray-600 text-sm">
            <div>
              <span className="font-semibold">{guild.memberCount}</span> members
            </div>
            <div>
              <span className="font-semibold">{badges.length}</span> badges
            </div>
            <div>
              Created {new Date(guild.createdAt).toLocaleDateString()}
            </div>
          </div>
          
          {/* Guild Description */}
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">About</h2>
            <p className="text-gray-700">{guild.description}</p>
          </div>
          
          {/* Guild Requirements */}
          {guild.requirements && guild.requirements.length > 0 && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold mb-2">Membership Requirements</h2>
              <ul className="list-disc list-inside text-gray-700">
                {guild.requirements.map((req, index) => (
                  <li key={index}>
                    {req.type === 'badge' ? (
                      <>Have the <span className="font-medium">{req.name}</span> badge</>
                    ) : (
                      req.description
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
      
      {/* Apply to Join Modal */}
      {isApplying && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Apply to Join {guild.name}</h2>
            
            <form onSubmit={handleApply}>
              <div className="mb-4">
                <label htmlFor="applicationMessage" className="block text-sm font-medium text-gray-700 mb-1">
                  Why do you want to join this guild?
                </label>
                <textarea
                  id="applicationMessage"
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={4}
                  placeholder="Tell the guild administrators a bit about yourself and why you'd like to join..."
                  disabled={isSubmitting}
                  maxLength={500}
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">
                  {applicationMessage.length}/500 characters
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsApplying(false)}
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
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Guild Content Tabs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="flex border-b">
          <button className="px-6 py-3 border-b-2 border-blue-600 font-medium text-blue-600">
            Members
          </button>
          <button className="px-6 py-3 text-gray-600 hover:text-gray-900">
            Badges
          </button>
          <button className="px-6 py-3 text-gray-600 hover:text-gray-900">
            Activities
          </button>
        </div>
        
        {/* Members Tab Content */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Members ({members.length})</h2>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search members..."
                className="pl-8 pr-3 py-1 border border-gray-300 rounded-md text-sm"
              />
              <svg className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
          
          <ul className="divide-y divide-gray-200">
            {members.map(member => (
              <li key={member.id} className="py-3 flex items-center">
                <img 
                  src={member.avatarUrl} 
                  alt={member.name} 
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="flex space-x-2 text-xs">
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {member.role}
                    </span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                      Tier {member.tier}
                    </span>
                    <span className="text-gray-500">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          
          {/* Pagination */}
          <div className="flex justify-center mt-4">
            <button className="px-3 py-1 border border-gray-300 rounded-l-md hover:bg-gray-100 disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white">
              1
            </button>
            <button className="px-3 py-1 border-t border-b border-gray-300 hover:bg-gray-100">
              2
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-r-md hover:bg-gray-100">
              Next
            </button>
          </div>
        </div>
      </div>
      
      {/* Recent Activities Section */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Upcoming Activities</h2>
        
        {activities.length === 0 ? (
          <p className="text-gray-600">No upcoming activities at the moment.</p>
        ) : (
          <div className="space-y-4">
            {activities.map(activity => (
              <div key={activity.id} className="border border-gray-200 rounded-md p-3 hover:bg-gray-50">
                <h3 className="font-medium">{activity.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    {new Date(activity.date).toLocaleString()}
                  </span>
                  <span>
                    {activity.participantCount} participants
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activities.length > 0 && (
          <div className="mt-4 text-center">
            <Link 
              to={`/guilds/${guild.id}/activities`} 
              className="text-blue-600 hover:underline"
            >
              View All Activities
            </Link>
          </div>
        )}
      </section>
      
      {/* Guild Badges Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Guild Badges</h2>
        
        {badges.length === 0 ? (
          <p className="text-gray-600">This guild hasn't created any badges yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {badges.map(badge => (
              <div key={badge.id} className="border border-gray-200 rounded-md p-3 flex items-center">
                <img 
                  src={badge.imageUrl} 
                  alt={badge.name} 
                  className="w-12 h-12 mr-3"
                />
                <div>
                  <div className="font-medium">{badge.name}</div>
                  <div className="text-xs text-gray-500">
                    Earned by {badge.earnedCount} members
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default GuildDetail;