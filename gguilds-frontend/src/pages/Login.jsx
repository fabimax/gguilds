// src/pages/Login.js
//  A login page with email and social login options
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Login = () => {
  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Get authentication functions from context
  const { login, socialLogin } = useAuth();
  
  // Use navigate for redirection after login
  const navigate = useNavigate();

  // Handle email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error state
    setError('');
    
    // Validate inputs
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      // Set loading state
      setIsLoading(true);
      
      // Call login function from auth context
      await login({ email, password });
      
      // Redirect to dashboard on successful login
      navigate('/dashboard');
    } catch (err) {
      // Handle login errors
      setError('Failed to log in. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };

  // Handle social login
  const handleSocialLogin = async (provider) => {
    try {
      // Set loading state
      setIsLoading(true);
      
      // Call social login function from auth context
      await socialLogin(provider);
      
      // Redirect to dashboard on successful login
      navigate('/dashboard');
    } catch (err) {
      // Handle social login errors
      setError(`Failed to log in with ${provider}. Please try again.`);
      console.error('Social login error:', err);
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Log In to GoodGuilds</h1>
      
      {/* Display errors if any */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Email/Password Login Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled={isLoading}
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled={isLoading}
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      
      {/* Social Login Options */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Twitter/X Login */}
        <button
          onClick={() => handleSocialLogin('twitter')}
          className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
          </svg>
          Twitter/X
        </button>
        
        {/* Google Login */}
        <button
          onClick={() => handleSocialLogin('google')}
          className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Twitch Login */}
        <button
          onClick={() => handleSocialLogin('twitch')}
          className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#9146FF">
            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
          </svg>
          Twitch
        </button>
        
        {/* Discord Login */}
        <button
          onClick={() => handleSocialLogin('discord')}
          className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#5865F2">
            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3847-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
          </svg>
          Discord
        </button>
      </div>
      
      {/* Registration Link */}
      <p className="text-center mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;