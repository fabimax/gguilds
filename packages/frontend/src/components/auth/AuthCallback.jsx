/**
 * Auth callback handler for social login redirects
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '@/stores/authStore';
import { createClient } from '@supabase/supabase-js';

const AuthCallback = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setAuthTokens, setUser } = useAuthStore();
  
  useEffect(() => {
    // Create a Supabase client for handling the auth callback
    // Note: These should be your public Supabase anon keys, not service keys
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      setError('Missing Supabase configuration. Please contact support.');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Handle the auth callback
    const handleAuthCallback = async () => {
      try {
        // Get the auth callback from Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (data?.session) {
          // Set the auth tokens
          setAuthTokens(
            data.session.access_token,
            data.session.refresh_token,
            data.session.expires_at
          );
          
          // Set the user if available
          if (data.session.user) {
            setUser(data.session.user);
          }
          
          toast.success('Logged in successfully!');
          
          // Redirect to dashboard
          navigate('/dashboard');
        } else {
          // No session found
          setError('No session found. Please try logging in again.');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Failed to complete authentication');
      }
    };
    
    handleAuthCallback();
  }, [navigate, setAuthTokens, setUser]);
  
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