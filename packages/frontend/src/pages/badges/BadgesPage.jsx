/**
 * Badges page component
 * Lists all badges with filtering and pagination
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '@/stores/authStore';
import useAuthStore from '@/stores/authStore';

const BadgesPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchBadges();
  }, [pagination.page]);
  
  const fetchBadges = async () => {
    try {
      setLoading(true);
      const response = await api.get('/badges', {
        params: {
          page: pagination.page,
          limit: pagination.limit
        }
      });
      
      setBadges(response.data.badges);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch badges:', error);
      toast.error('Failed to load badges');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Reset to first page when searching
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }));
    } else {
      fetchBadges();
    }
  };
  
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
  // Filter badges by search term
  const filteredBadges = badges.filter(badge => 
    badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (badge.description && badge.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Badges</h1>
        {user && (
          <Link to="/badges/create" className="btn btn-primary">
            Create Badge
          </Link>
        )}
      </div>
      
      {/* Search and Filter */}
      <div className="card mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search badges..."
            className="input flex-grow"
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>
      
      {/* My Badges Link */}
      {user && (
        <div className="mb-8">
          <Link to="/badges/my-badges" className="text-primary-600 hover:text-primary-800">
            View badges you've created →
          </Link>
        </div>
      )}
      
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
                  : 'There are no badges available yet'}
              </p>
              {user && (
                <Link to="/badges/create" className="btn btn-primary">
                  Create the First Badge
                </Link>
              )}
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
                    {badge.creator && (
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center">
                        <div className="flex items-center">
                          {badge.creator.avatar_url ? (
                            <img
                              src={badge.creator.avatar_url}
                              alt={badge.creator.name}
                              className="w-6 h-6 rounded-full mr-2"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                              <span className="text-gray-600 text-xs">
                                {badge.creator.name ? badge.creator.name.charAt(0) : '?'}
                              </span>
                            </div>
                          )}
                          <span className="text-sm text-gray-500">
                            {badge.creator.name || 'Unknown creator'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show current page, first page, last page, and 1 page around current
                    return (
                      page === 1 ||
                      page === pagination.pages ||
                      Math.abs(page - pagination.page) <= 1
                    );
                  })
                  .map((page, i, arr) => (
                    <React.Fragment key={page}>
                      {i > 0 && arr[i - 1] !== page - 1 && (
                        <span className="px-2">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded ${
                          pagination.page === page
                            ? 'bg-primary-600 text-white'
                            : 'border'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BadgesPage;