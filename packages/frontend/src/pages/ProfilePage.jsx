/**
 * Profile page component
 * Allows users to view and edit their profile
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/stores/authStore';
import { api } from '@/stores/authStore';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, token, setUser } = useAuthStore();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  
  // Form state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Fix for ensuring the auth token is in headers
  useEffect(() => {
    // Only run this once to set the header if needed
    if (token && !api.defaults.headers.common['Authorization']) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);
  
  // Separate effect for fetching profile to avoid dependency cycles
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        navigate('/login');
        return;
      }
      
      try {
        setLoading(true);
        const response = await api.get('/users/me');
        
        setUserProfile(response.data.profile);
        
        // Initialize form state with user data
        setName(response.data.profile.name || '');
        setBio(response.data.profile.bio || '');
        setAvatarUrl(response.data.profile.avatar_url || '');
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        toast.error('Failed to load profile data');
        
        // If unauthorized, redirect to login
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [token, navigate]); // Minimal dependencies to prevent loops
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      const response = await api.put('/users/me', {
        name,
        bio,
        avatar_url: avatarUrl
      });
      
      // Update local state
      setUserProfile(response.data.profile);
      
      // Update auth store
      setUser({
        ...user,
        name: response.data.profile.name
      });
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      
      <div className="card mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center mb-6">
            <div className="mb-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 font-medium text-2xl">
                    {name ? name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Enter an image URL to change your avatar
            </p>
          </div>
          
          {/* Form Fields */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
          
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              rows="4"
              className="input"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a bit about yourself"
              maxLength={500}
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">
              {bio.length}/500 characters
            </p>
          </div>
          
          <div>
            <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Avatar URL
            </label>
            <input
              id="avatarUrl"
              type="url"
              className="input"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/your-avatar.jpg"
            />
          </div>
          
          <div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Account Information */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Account Information</h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p>{userProfile.email}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Member Since</p>
            <p>{new Date(userProfile.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;