// src/App.jsx formerly App.js
//The main application component with routing set up using React Router
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layout components
import Layout from './components/layout/Layout.jsx';

// Page components
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import GuildCreate from './pages/GuildCreate.jsx';
import GuildProfile from './pages/GuildProfile.jsx';
import GuildManage from './pages/GuildManage.jsx';
import UserProfile from './pages/UserProfile.jsx';
import BadgeManage from './pages/BadgeManage.jsx';

// Context providers for global state management
import { AuthProvider } from './contexts/AuthContext.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            
            {/* Protected routes - will need authentication check later */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="guilds/create" element={<GuildCreate />} />
            <Route path="guilds/:guildId" element={<GuildProfile />} />
            <Route path="guilds/:guildId/manage" element={<GuildManage />} />
            <Route path="badges/manage" element={<BadgeManage />} />
            
            {/* Catch-all for 404 - can add a NotFound component later */}
            <Route path="*" element={<div>Page not found</div>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;