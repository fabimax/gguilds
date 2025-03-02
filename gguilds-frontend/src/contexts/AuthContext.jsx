// src/contexts/AuthContext.js
// An authentication context to manage user state throughout the app
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context for authentication
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component that wraps the application and makes auth object available
export const AuthProvider = ({ children }) => {
  // State to hold the authenticated user information
  const [user, setUser] = useState(null);
  // State to track if the authentication check has been made
  const [loading, setLoading] = useState(true);

  // Computed property to check if user is authenticated
  const isAuthenticated = !!user;

  // Effect to check if user is already logged in (e.g., from localStorage)
  useEffect(() => {
    // Check if there's a user in localStorage
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('user');
      }
    }
    
    // No longer loading
    setLoading(false);
  }, []);

  // Function to handle user login
  const login = async (credentials) => {
    // This is a placeholder. In a real app, you'd make an API call to authenticate
    // For now, we'll just simulate a successful login
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock user for now
    const mockUser = {
      id: '1',
      email: credentials.email,
      name: 'Test User',
      avatarUrl: 'https://via.placeholder.com/100',
    };
    
    // Save user to state and localStorage
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    return mockUser;
  };

  // Function to handle social login
  const socialLogin = async (provider) => {
    // This is a placeholder. In a real app, you'd integrate with Supabase or your auth provider
    console.log(`Social login with ${provider}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock user for social login
    const mockUser = {
      id: '2',
      email: `social_user@${provider}.com`,
      name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
      avatarUrl: 'https://via.placeholder.com/100',
      provider
    };
    
    // Save user to state and localStorage
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    return mockUser;
  };

  // Function to handle user registration
  const register = async (userData) => {
    // This is a placeholder. In a real app, you'd make an API call to register
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock user for now
    const mockUser = {
      id: '3',
      email: userData.email,
      name: userData.name || 'New User',
      avatarUrl: 'https://via.placeholder.com/100',
    };
    
    // Save user to state and localStorage
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    return mockUser;
  };

  // Function to handle user logout
  const logout = () => {
    // Remove user from state and localStorage
    setUser(null);
    localStorage.removeItem('user');
  };

  // Create value object with auth state and functions
  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    socialLogin,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};