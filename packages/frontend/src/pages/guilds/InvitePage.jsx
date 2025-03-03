/**
 * Guild Invitation Page component
 * Handles accepting guild invitations via invitation tokens
 */
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '@/stores/authStore';
import useAuthStore from '@/stores/authStore';

const InvitePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState(null);
  const [guildInfo, setGuildInfo] = useState(null);
  
  const inviteToken = searchParams.get('token');
  
  useEffect(() => {
    // Validate the token parameter
    if (!inviteToken) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }
    
    // If not authenticated, redirect to login
    if (!token) {
      // Store the invitation URL to redirect back after login
      sessionStorage.setItem('redirectAfterAuth', window.location.href);
      navigate('/login');
      return;
    }
    
    setLoading(false);
  }, [inviteToken, token, navigate]);
  
  const handleAcceptInvitation = async () => {
    try {
      setAccepting(true);
      setError(null);
      
      const response = await api.post('/guilds/invitations/accept', {
        token: inviteToken
      });
      
      setGuildInfo({
        id: response.data.guild_id,
        name: response.data.guild_name
      });
      
      toast.success(response.data.message);
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      setError(error.response?.data?.message || 'Failed to accept invitation');
      toast.error(error.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // If we've successfully joined, show success message
  if (guildInfo) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="bg-green-100 text-green-800 p-6 rounded-lg mb-6">
          <svg className="w-16 h-16 mx-auto mb-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold mb-2">You've joined {guildInfo.name}!</h2>
          <p>You are now a member of this guild.</p>
        </div>
        
        <div className="flex flex-col space-y-3">
          <Link to={`/guilds/${guildInfo.id}`} className="btn btn-primary">
            Go to Guild Page
          </Link>
          <Link to="/dashboard" className="btn btn-outline">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto text-center">
      <h1 className="text-3xl font-bold mb-6">Guild Invitation</h1>
      
      {error ? (
        <div className="bg-red-100 text-red-800 p-6 rounded-lg mb-6">
          <svg className="w-12 h-12 mx-auto mb-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold mb-2">Invitation Error</h2>
          <p>{error}</p>
        </div>
      ) : (
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">You've been invited to join a guild</h2>
          <p className="mb-6">
            You'll be joining as <span className="font-medium">{user?.name || user?.email || 'Unknown User'}</span>
          </p>
          
          <button
            onClick={handleAcceptInvitation}
            className="btn btn-primary w-full"
            disabled={accepting}
          >
            {accepting ? 'Joining...' : 'Accept Invitation'}
          </button>
        </div>
      )}
      
      <div>
        <Link to="/guilds" className="text-primary-600">
          Return to Guilds
        </Link>
      </div>
    </div>
  );
};

export default InvitePage;