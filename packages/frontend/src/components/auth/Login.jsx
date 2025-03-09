/**
 * Login form component
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '@/stores/authStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, getTwitterAuthUrl, getTwitchAuthUrl, loading, error } = useAuthStore();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await login(email, password);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (err) {
      // Error is already captured in the store
      toast.error(error || 'Login failed. Please try again.');
    }
  };
  
  const handleTwitterLogin = async () => {
    try {
      // Get the current URL for redirect
      const redirectTo = `${window.location.origin}/auth/callback`;
      
      // Get the Twitter auth URL
      const twitterUrl = await getTwitterAuthUrl(redirectTo);
      
      // Redirect to Twitter auth
      window.location.href = twitterUrl;
    } catch (err) {
      toast.error('Failed to connect with Twitter. Please try again.');
    }
  };
  
  const handleTwitchLogin = async () => {
    try {
      // Get the current URL for redirect
      const redirectTo = `${window.location.origin}/auth/callback`;
      
      // Get the Twitch auth URL
      const twitchUrl = await getTwitchAuthUrl(redirectTo);
      
      // Redirect to Twitch auth
      window.location.href = twitchUrl;
    } catch (err) {
      toast.error('Failed to connect with Twitch. Please try again.');
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto p-6 card">
      <h2 className="text-2xl font-bold text-center mb-6">Log in to GoodGuilds</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="youremail@example.com"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        
        <button
          type="submit"
          className="btn btn-primary w-full mb-4"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
        
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-gray-300 flex-grow"></div>
          <span className="px-2 text-gray-500 text-sm">Or continue with</span>
          <div className="border-t border-gray-300 flex-grow"></div>
        </div>
        
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleTwitterLogin}
            className="btn btn-outline flex items-center justify-center gap-2"
            disabled={loading}
          >
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.162 5.656a8.384 8.384 0 01-2.402.658A4.196 4.196 0 0021.6 4c-.82.488-1.719.83-2.656 1.015a4.182 4.182 0 00-7.126 3.814 11.874 11.874 0 01-8.62-4.37 4.168 4.168 0 00-.566 2.103c0 1.45.738 2.731 1.86 3.481a4.168 4.168 0 01-1.894-.523v.052a4.185 4.185 0 003.355 4.101 4.21 4.21 0 01-1.89.072A4.185 4.185 0 007.97 16.65a8.394 8.394 0 01-6.191 1.732 11.83 11.83 0 006.41 1.88c7.693 0 11.9-6.373 11.9-11.9 0-.18-.005-.362-.013-.54a8.496 8.496 0 002.087-2.165z"/>
            </svg>
            Twitter/X
          </button>
          
          <button
            type="button"
            onClick={handleTwitchLogin}
            className="btn btn-outline flex items-center justify-center gap-2"
            disabled={loading}
          >
            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.64 5.93H13.07V10.21H11.64M15.57 5.93H17V10.21H15.57M7 2L3.43 5.57V18.43H7.71V22L11.29 18.43H14.14L20.57 12V2M19.14 11.29L16.29 14.14H13.43L10.93 16.64V14.14H7.71V3.43H19.14Z" />
            </svg>
            Twitch
          </button>
        </div>
      </form>
      
      <p className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link to="/signup" className="text-primary-600 hover:text-primary-700">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;