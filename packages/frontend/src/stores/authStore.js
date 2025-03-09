/**
 * Authentication store for managing user auth state
 * Using Zustand for state management
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// Create an axios instance with default config
export const api = axios.create({
  baseURL: '/api', // Will be proxied by Vite in dev
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth store with persistence
const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      refreshToken: null,
      tokenExpiry: null,
      loading: false,
      error: null,
      
      // Actions
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      // Set auth tokens
      setAuthTokens: (token, refreshToken, expiresAt) => {
        set({
          token,
          refreshToken,
          tokenExpiry: expiresAt,
        });
        
        // Set the token in axios headers for all future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      },
      
      // Clear auth state (logout)
      clearAuth: () => {
        // Remove the auth header
        delete api.defaults.headers.common['Authorization'];
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          tokenExpiry: null,
          error: null,
        });
      },
      
      // Login with email/password
      login: async (email, password) => {
        set({ loading: true, error: null });
        
        try {
          const response = await api.post('/auth/login', { email, password });
          const { user, session } = response.data;
          
          // Set the auth tokens
          get().setAuthTokens(
            session.access_token,
            session.refresh_token,
            session.expires_at
          );
          
          // Set the user
          set({ user, loading: false });
          
          return user;
        } catch (error) {
          console.error('Login error:', error);
          set({
            loading: false,
            error: error.response?.data?.message || 'Login failed',
          });
          throw error;
        }
      },
      
      // Register with email/password
      register: async (email, password, name) => {
        set({ loading: true, error: null });
        
        try {
          const response = await api.post('/auth/signup', { email, password, name });
          
          // Registration successful, now login
          return await get().login(email, password);
        } catch (error) {
          console.error('Registration error:', error);
          set({
            loading: false,
            error: error.response?.data?.message || 'Registration failed',
          });
          throw error;
        }
      },
      
      // Get Twitter auth URL
      getTwitterAuthUrl: async (redirectTo) => {
        set({ loading: true, error: null });
        
        try {
          const response = await api.get(`/auth/twitter?redirectTo=${encodeURIComponent(redirectTo)}`);
          set({ loading: false });
          
          return response.data.url;
        } catch (error) {
          console.error('Twitter auth URL error:', error);
          set({
            loading: false,
            error: error.response?.data?.message || 'Failed to get Twitter auth URL',
          });
          throw error;
        }
      },
      
      // Get Twitch auth URL
      getTwitchAuthUrl: async (redirectTo) => {
        set({ loading: true, error: null });
        
        try {
          const response = await api.get(`/auth/twitch?redirectTo=${encodeURIComponent(redirectTo)}`);
          set({ loading: false });
          
          return response.data.url;
        } catch (error) {
          console.error('Twitch auth URL error:', error);
          set({
            loading: false,
            error: error.response?.data?.message || 'Failed to get Twitch auth URL',
          });
          throw error;
        }
      },
      
      // Logout
      logout: async () => {
        if (get().token) {
          try {
            await api.post('/auth/logout');
          } catch (error) {
            console.error('Logout error:', error);
            // Continue with logout anyway
          }
        }
        
        get().clearAuth();
      },
      
      // Get user profile
      fetchUserProfile: async () => {
        // Only attempt if we have a token
        if (!get().token) return null;
        
        set({ loading: true, error: null });
        
        try {
          const response = await api.get('/users/me');
          const userData = response.data.profile;
          
          set({
            user: userData,
            loading: false,
          });
          
          return userData;
        } catch (error) {
          console.error('Fetch user profile error:', error);
          
          // If unauthorized, clear auth
          if (error.response?.status === 401) {
            get().clearAuth();
          }
          
          set({
            loading: false,
            error: error.response?.data?.message || 'Failed to fetch user profile',
          });
          
          return null;
        }
      },
      
      // Check if token needs refresh and refresh if needed
      checkAndRefreshToken: async () => {
        const { token, refreshToken, tokenExpiry } = get();
        
        // If no tokens, we can't refresh
        if (!token || !refreshToken) return false;
        
        // Check if token is expired or will expire in the next minute
        const isExpired = tokenExpiry && new Date(tokenExpiry * 1000) <= new Date(Date.now() + 60000);
        
        if (isExpired) {
          try {
            const response = await axios.post('/api/auth/refresh', {
              refresh_token: refreshToken,
            });
            
            const { session } = response.data;
            
            // Update tokens
            get().setAuthTokens(
              session.access_token,
              session.refresh_token,
              session.expires_at
            );
            
            return true;
          } catch (error) {
            console.error('Token refresh error:', error);
            get().clearAuth();
            return false;
          }
        }
        
        return true; // Token is still valid
      },
      
      // Initialize auth - called on app mount
      initialize: async () => {
        const { token, fetchUserProfile, checkAndRefreshToken } = get();
        
        if (token) {
          // Set the token in axios headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Check and refresh token if needed
          const tokenValid = await checkAndRefreshToken();
          
          if (tokenValid) {
            // Fetch the user profile
            await fetchUserProfile();
          }
        }
      },
    }),
    {
      name: 'goodguilds-auth', // storage key
      partialize: (state) => ({
        // Only persist these fields
        token: state.token,
        refreshToken: state.refreshToken,
        tokenExpiry: state.tokenExpiry,
        user: state.user,
      }),
    }
  )
);

export default useAuthStore;

// Set up axios interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const authStore = useAuthStore.getState();
      
      // Try to refresh the token
      const refreshed = await authStore.checkAndRefreshToken();
      
      if (refreshed) {
        // Retry the original request with new token
        return api(originalRequest);
      }
    }
    
    return Promise.reject(error);
  }
);