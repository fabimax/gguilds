/**
 * Guilds page component
 * Lists all guilds with filtering and pagination
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '@/stores/authStore';

const GuildsPage = () => {
  const [loading, setLoading] = useState(true);
  const [guilds, setGuilds] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchGuilds();
  }, [pagination.page]);
  
  const fetchGuilds = async () => {
    try {
      setLoading(true);
      const response = await api.get('/guilds', {
        params: {
          page: pagination.page,
          limit: pagination.limit
        }
      });
      
      setGuilds(response.data.guilds);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch guilds:', error);
      toast.error('Failed to load guilds');
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
      fetchGuilds();
    }
  };
  
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
  // Filter guilds by search term
  const filteredGuilds = guilds.filter(guild => 
    guild.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Guilds</h1>
        <Link to="/guilds/create" className="btn btn-primary">
          Create Guild
        </Link>
      </div>
      
      {/* Search and Filter */}
      <div className="card mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search guilds..."
            className="input flex-grow"
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>
      
      {/* Guilds Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-16 h-16 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {filteredGuilds.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded">
              <h2 className="text-xl font-bold mb-2">No Guilds Found</h2>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? `No guilds match your search for "${searchTerm}"`
                  : 'There are no guilds available yet'}
              </p>
              <Link to="/guilds/create" className="btn btn-primary">
                Create the First Guild
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuilds.map((guild) => (
                <Link
                  to={`/guilds/${guild.id}`}
                  key={guild.id}
                  className="card hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="p-4">
                    <div className="flex items-center mb-4">
                      {guild.icon_url ? (
                        <img
                          src={guild.icon_url}
                          alt={guild.name}
                          className="w-16 h-16 rounded-full object-cover mr-4"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                          <span className="text-primary-600 font-bold text-xl">
                            {guild.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold">{guild.name}</h3>
                        <p className="text-gray-500">
                          {guild.member_count} {guild.member_count === 1 ? 'member' : 'members'}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4 line-clamp-2">
                      {guild.description || 'No description available'}
                    </p>
                    
                    <div className="text-gray-500 text-sm">
                      Created {new Date(guild.created_at).toLocaleDateString()}
                    </div>
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

export default GuildsPage;