// src/pages/Home.js
// A landing page that introduces GoodGuilds to new users
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <section className="py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to GoodGuilds</h1>
        <p className="text-xl mb-8">
          Join guilds, earn badges, and connect with like-minded communities
        </p>
        
        {/* CTA Buttons */}
        <div className="flex justify-center space-x-4">
          {isAuthenticated ? (
            <Link 
              to="/dashboard" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link 
                to="/register" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Sign Up
              </Link>
              <Link 
                to="/login" 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg"
              >
                Log In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Key Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Guild Feature */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Create & Join Guilds</h3>
            <p className="text-gray-600">
              Form communities with shared interests or goals. Manage members with custom roles and tiers.
            </p>
          </div>
          
          {/* Badge Feature */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Earn & Assign Badges</h3>
            <p className="text-gray-600">
              Recognize achievements and contributions with customizable badges for users and guilds.
            </p>
          </div>
          
          {/* Activities Feature */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Participate in Activities</h3>
            <p className="text-gray-600">
              Discover and join guild activities. Collaborate with other communities on shared projects.
            </p>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
        
        <div className="space-y-6">
          <div className="flex items-start">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Create Your Account</h3>
              <p className="text-gray-600">
                Sign up with email or connect with your existing social media accounts.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Find or Create Guilds</h3>
              <p className="text-gray-600">
                Join existing communities or start your own guild to gather like-minded individuals.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Participate & Earn</h3>
              <p className="text-gray-600">
                Take part in guild activities, vote on decisions, and earn badges for your contributions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;