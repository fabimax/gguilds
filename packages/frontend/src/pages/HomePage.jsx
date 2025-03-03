/**
 * Home page component - Landing page for the application
 */
import { Link } from 'react-router-dom';
import useAuthStore from '@/stores/authStore';

const HomePage = () => {
  const { user } = useAuthStore();
  
  return (
    <div>
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Join Communities, Earn Recognition
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            GoodGuilds connects you with communities that share your interests and recognizes your achievements with badges.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary text-center">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary text-center">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-outline text-center">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            GoodGuilds makes it easy to connect with communities and showcase your achievements.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="card text-center p-6">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Join Guilds</h3>
            <p className="text-gray-600">
              Find and join communities that match your interests and connect with like-minded people.
            </p>
          </div>
          
          {/* Feature 2 */}
          <div className="card text-center p-6">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Earn Badges</h3>
            <p className="text-gray-600">
              Get recognized for your contributions and achievements with badges that highlight your skills.
            </p>
          </div>
          
          {/* Feature 3 */}
          <div className="card text-center p-6">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Manage Profile</h3>
            <p className="text-gray-600">
              Showcase your guild memberships and badges on your profile to build your digital identity.
            </p>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Join GoodGuilds today and start connecting with communities and earning recognition.
        </p>
        
        {user ? (
          <Link to="/dashboard" className="btn btn-primary text-center">
            Go to Dashboard
          </Link>
        ) : (
          <Link to="/signup" className="btn btn-primary text-center">
            Create Your Account
          </Link>
        )}
      </section>
    </div>
  );
};

export default HomePage;