// src/components/layout/Layout.js
// A layout component with navigation that adapts based on authentication state
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// This component provides the main layout for the application
// It includes navigation, footer, and wraps the content
const Layout = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Header */}
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">GoodGuilds</Link>
          
          <nav>
            <ul className="flex space-x-4">
              <li><Link to="/" className="hover:underline">Home</Link></li>
              
              {/* Conditionally render links based on authentication state */}
              {isAuthenticated ? (
                <>
                  <li><Link to="/dashboard" className="hover:underline">Dashboard</Link></li>
                  <li><Link to="/guilds/create" className="hover:underline">Create Guild</Link></li>
                  <li><Link to="/badges/manage" className="hover:underline">Badges</Link></li>
                  <li><Link to="/profile" className="hover:underline">Profile</Link></li>
                  <li>
                    <button 
                      onClick={logout} 
                      className="hover:underline"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li><Link to="/login" className="hover:underline">Login</Link></li>
                  <li><Link to="/register" className="hover:underline">Register</Link></li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4">
        <div className="container mx-auto">
          <p className="text-center">&copy; {new Date().getFullYear()} GoodGuilds. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;