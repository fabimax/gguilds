/**
 * Main App component with routing setup
 */
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import useAuthStore from './stores/authStore';

// Layout
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth Pages
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import AuthCallback from './components/auth/AuthCallback';

// Public Pages
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Pages
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';

// Guild pages
import GuildsPage from './pages/guilds/GuildsPage';
import GuildDetailPage from './pages/guilds/GuildDetailPage';
import CreateGuildPage from './pages/guilds/CreateGuildPage';
import InvitePage from './pages/guilds/InvitePage';

// Badge pages
import BadgesPage from './pages/badges/BadgesPage';
import CreateBadgePage from './pages/badges/CreateBadgePage';
import BadgeDetailPage from './pages/badges/BadgeDetailPage';
import MyBadgesPage from './pages/badges/MyBadgesPage';

const App = () => {
  const { initialize } = useAuthStore();
  
  // Initialize auth state on app mount
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes with layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Guild routes */}
            <Route path="/guilds" element={<GuildsPage />} />
            <Route path="/guilds/create" element={<CreateGuildPage />} />
            <Route path="/guilds/:guildId" element={<GuildDetailPage />} />
            <Route path="/invite" element={<InvitePage />} />
            
            {/* Badge routes */}
            <Route path="/badges" element={<BadgesPage />} />
            <Route path="/badges/create" element={<CreateBadgePage />} />
            <Route path="/badges/my-badges" element={<MyBadgesPage />} />
            <Route path="/badges/:badgeId" element={<BadgeDetailPage />} />
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        
        {/* Auth callback route - no layout */}
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;