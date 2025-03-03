/**
 * My Badges page component
 * Shows badges created by the current user
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '@/stores/authStore';

const MyBadgesPage = () => {
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchMyBadges();
  }, []);
  
  const fetchMyBadges = async () => {
    try {
      setLoading(true);
      const response = await api.get('/badges/my-badges');
      
      setBadges(response.data.badges);
    } catch (error) {
      console.error('Failed to fetch my badges:', error);
      toast.error('Failed to load your badges');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    // Just filter the existing badges, no need to fetch again
  };
  
  // Filter badges by search term
  const filteredBadges = badges.filter(badge => 
    badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (badge.description && badge.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Badges</h1>
          <p className="text-gray-500 mt-2">Badges you've created</p>
        </div>
        <Link to="/badges/create" className="btn btn-primary">
          Create Badge
        </Link>
      </div>
      
      {/* Search */}
      <div className="card mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your badges..."
            className="input flex-grow"
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>
      
      {/* Back to all badges */}
      <div className="mb-8">
        <Link to="/badges" className="text-primary-600 hover:text-primary-800">
          ← Back to all badges
        </Link>
      </div>
      
      {/* Badges Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-16 h-16 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {filteredBadges.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded">
              <h2 className="text-xl font-bold mb-2">No Badges Found</h2>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? `No badges match your search for "${searchTerm}"`
                  : "You haven't created any badges yet"}
              </p>
              <Link to="/badges/create" className="btn btn-primary">
                Create Your First Badge
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBadges.map((badge) => (
                <Link
                  to={`/badges/${badge.id}`}
                  key={badge.id}
                  className="card hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="p-4 text-center">
                    <div className="mb-3 flex justify-center">
                      {badge.icon_url ? (
                        <img
                          src={badge.icon_url}
                          alt={badge.name}
                          className="w-24 h-24 object-contain"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-bold text-xl">
                            {badge.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold">{badge.name}</h3>
                    {badge.description && (
                      <p className="text-gray-500 mt-2 line-clamp-2">
                        {badge.description}
                      </p>
                    )}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-500">
                        Created: {new Date(badge.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyBadgesPage;