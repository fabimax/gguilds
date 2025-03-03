/**
 * Dashboard page component
 * Shows user's guilds, badges, and quick actions
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '@/stores/authStore';
import { api } from '@/stores/authStore';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [guilds, setGuilds] = useState([]);
  const [badges, setBadges] = useState([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/users/me');
        
        setUserProfile(response.data.profile);
        setGuilds(response.data.guilds || []);
        setBadges(response.data.badges || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {/* Welcome Card */}
      <div className="card mb-8 bg-gradient-to-r from-primary-500 to-primary-700 text-white">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {userProfile?.name || 'User'}!</h2>
          <p className="opacity-90">
            Manage your guilds, badges, and profile all from this dashboard.
          </p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* My Guilds Section */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">My Guilds</h2>
            <Link to="/guilds/create" className="btn btn-primary btn-sm">
              Create Guild
            </Link>
          </div>
          
          {guilds.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded">
              <p className="text-gray-500 mb-4">You haven't joined any guilds yet.</p>
              <Link to="/guilds" className="btn btn-outline btn-sm">
                Explore Guilds
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {guilds.map((guild) => (
                <div key={guild.id} className="flex items-center p-3 border rounded hover:bg-gray-50">
                  <div className="flex-shrink-0 mr-3">
                    {guild.icon_url ? (
                      <img
                        src={guild.icon_url}
                        alt={guild.name}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 font-medium text-lg">
                          {guild.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">{guild.name}</h3>
                    <p className="text-sm text-gray-500">
                      Role: {guild.role.charAt(0).toUpperCase() + guild.role.slice(1)}
                    </p>
                  </div>
                  <Link
                    to={`/guilds/${guild.id}`}
                    className="btn btn-outline btn-sm"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* My Badges Section */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">My Badges</h2>
            <Link to="/badges" className="btn btn-outline btn-sm">
              View All
            </Link>
          </div>
          
          {badges.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded">
              <p className="text-gray-500">You haven't earned any badges yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {badges.slice(0, 6).map((badge) => (
                <div key={badge.id} className="text-center p-3 border rounded hover:bg-gray-50">
                  <div className="mx-auto mb-2">
                    {badge.icon_url ? (
                      <img
                        src={badge.icon_url}
                        alt={badge.name}
                        className="w-12 h-12 mx-auto"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                        <span className="text-gray-500 font-medium text-lg">
                          {badge.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-sm">{badge.name}</h3>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/guilds/create"
            className="p-4 border rounded text-center hover:bg-gray-50"
          >
            <svg className="w-8 h-8 mx-auto mb-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Create Guild</span>
          </Link>
          
          <Link
            to="/guilds"
            className="p-4 border rounded text-center hover:bg-gray-50"
          >
            <svg className="w-8 h-8 mx-auto mb-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Explore Guilds</span>
          </Link>
          
          <Link
            to="/badges"
            className="p-4 border rounded text-center hover:bg-gray-50"
          >
            <svg className="w-8 h-8 mx-auto mb-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span>View Badges</span>
          </Link>
          
          <Link
            to="/profile"
            className="p-4 border rounded text-center hover:bg-gray-50"
          >
            <svg className="w-8 h-8 mx-auto mb-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;