// packages/frontend/src/components/auth/AuthCallback.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '@/stores/authStore';
import { api } from '@/stores/authStore';

const AuthCallback = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setAuthTokens, setUser } = useAuthStore();
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Extract authentication data from URL
        // Supabase usually includes an access_token in the URL fragment (hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const expiresIn = hashParams.get('expires_in');
        
        if (!accessToken) {
          console.error('No access token found in callback URL');
          setError('Authentication failed. No access token received.');
          return;
        }
        
        // Calculate token expiry
        const expiresAt = expiresIn ? Math.floor(Date.now() / 1000) + parseInt(expiresIn) : null;
        
        // Verify tokens with our backend
        const response = await api.post('/auth/verify-tokens', { 
          access_token: accessToken 
        });
        
        // Set the auth tokens in our store
        setAuthTokens(accessToken, refreshToken, expiresAt);
        
        // Set user from the response
        if (response.data.user) {
          setUser(response.data.user);
          toast.success('Logged in successfully!');
          navigate('/dashboard');
        } else {
          setError('Failed to retrieve user information');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err.response?.data?.message || 'Failed to complete authentication');
      }
    };
    
    handleAuthCallback();
  }, [navigate, setAuthTokens, setUser]);
  
  // Rest of component remains the same
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      {error ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary"
          >
            Back to Login
          </button>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Completing authentication...</h2>
          <div className="w-16 h-16 border-t-4 border-primary-600 border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      )}
    </div>
  );
};

export default AuthCallback;