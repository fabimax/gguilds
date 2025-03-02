// src/pages/Dashboard.js
// A user dashboard showing guilds, badges, and recent activity
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Dashboard = () => {
  const { user } = useAuth();
  
  // State for user's guilds and badges
  const [userGuilds, setUserGuilds] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch user guilds and badges on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, these would be API calls
        // For now, we'll use mock data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock guild data
        const mockGuilds = [
          {
            id: 'g1',
            name: 'Web Developers Guild',
            description: 'A community for web developers',
            role: 'Admin',
            tier: 'S',
            memberCount: 42,
            avatarUrl: 'https://via.placeholder.com/50'
          },
          {
            id: 'g2',
            name: 'Digital Artists Collective',
            description: 'For those who create digital art',
            role: 'Member',
            tier: 'A',
            memberCount: 128,
            avatarUrl: 'https://via.placeholder.com/50'
          }
        ];
        
        // Mock badge data
        const mockBadges = [
          {
            id: 'b1',
            name: 'JavaScript Expert',
            description: 'Awarded for JavaScript expertise',
            issuer: 'Web Developers Guild',
            issuedDate: '2024-01-15',
            imageUrl: 'https://via.placeholder.com/40'
          },
          {
            id: 'b2',
            name: 'Community Contributor',
            description: 'For valuable contributions to the community',
            issuer: 'GoodGuilds',
            issuedDate: '2024-02-10',
            imageUrl: 'https://via.placeholder.com/40'
          },
          {
            id: 'b3',
            name: 'UI Design Award',
            description: 'Recognizing excellent UI design skills',
            issuer: 'Digital Artists Collective',
            issuedDate: '2024-02-28',
            imageUrl: 'https://via.placeholder.com/40'
          }
        ];
        
        setUserGuilds(mockGuilds);
        setUserBadges(mockBadges);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome Section */}
      <section className="mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <img 
              src={user?.avatarUrl || 'https://via.placeholder.com/60'} 
              alt="Profile" 
              className="w-16 h-16 rounded-full mr-4"
            />
            <div>
              <h1 className="text-2xl font-bold">Welcome, {user?.name || 'User'}!</h1>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
          <div className="flex space-x-4">
            <Link 
              to="/profile" 
              className="text-blue-600 hover:underline"
            >
              View Profile
            </Link>
            <Link 
              to="/guilds/create" 
              className="text-blue-600 hover:underline"
            >
              Create New Guild
            </Link>
          </div>
        </div>
      </section>
      
      {/* My Guilds Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">My Guilds</h2>
          <Link 
            to="/guilds/discover" 
            className="text-sm text-blue-600 hover:underline"
          >
            Discover Guilds
          </Link>
        </div>
        
        {userGuilds.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="mb-4">You haven't joined any guilds yet.</p>
            <Link 
              to="/guilds/discover" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Find Guilds to Join
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userGuilds.map(guild => (
              <div key={guild.id} className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center mb-3">
                  <img 
                    src={guild.avatarUrl} 
                    alt={guild.name} 
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <h3 className="font-semibold">{guild.name}</h3>
                    <div className="flex space-x-2 text-sm">
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        {guild.role}
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                        Tier {guild.tier}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{guild.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{guild.memberCount} members</span>
                  <Link 
                    to={`/guilds/${guild.id}`} 
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Guild
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* My Badges Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">My Badges</h2>
          <Link 
            to="/badges/manage" 
            className="text-sm text-blue-600 hover:underline"
          >
            Manage Badges
          </Link>
        </div>
        
        {userBadges.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p>You haven't earned any badges yet.</p>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-lg shadow-md">
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
          </div>
        )}
      </section>
      
      {/* Recent Activity Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <ul className="divide-y divide-gray-200">
            <li className="py-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm">
                    You earned the <span className="font-medium">UI Design Award</span> badge
                  </p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
            </li>
            <li className="py-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm">
                    You were promoted to <span className="font-medium">Tier A</span> in Digital Artists Collective
                  </p>
                  <p className="text-xs text-gray-500">5 days ago</p>
                </div>
              </div>
            </li>
            <li className="py-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm">
                    <span className="font-medium">Web Developers Guild</span> opened voting on a new poll
                  </p>
                  <p className="text-xs text-gray-500">1 week ago</p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;