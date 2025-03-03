/**
 * Create Badge page component
 * Form for creating a new badge
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '@/stores/authStore';

const CreateBadgePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Badge name is required');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await api.post('/badges', {
        name,
        description,
        icon_url: iconUrl
      });
      
      toast.success('Badge created successfully!');
      navigate(`/badges/${response.data.badge.id}`);
    } catch (error) {
      console.error('Failed to create badge:', error);
      toast.error(error.response?.data?.message || 'Failed to create badge');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-8">
        <Link to="/badges" className="text-primary-600 mr-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-3xl font-bold">Create a New Badge</h1>
      </div>
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Badge Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter badge name"
              required
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              {name.length}/50 characters
            </p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows="4"
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this badge represents"
              maxLength={500}
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/500 characters
            </p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="iconUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Icon URL
            </label>
            <input
              id="iconUrl"
              type="url"
              className="input"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              placeholder="https://example.com/icon.png"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a URL to an image for your badge's icon
            </p>
          </div>
          
          {/* Icon Preview */}
          <div className="mb-6">
            <p className="block text-sm font-medium text-gray-700 mb-2">
              Preview
            </p>
            <div className="flex flex-col items-center p-6 bg-gray-50 rounded border">
              <div className="mb-4">
                {iconUrl ? (
                  <img
                    src={iconUrl}
                    alt="Badge icon preview"
                    className="w-24 h-24 object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "";
                      toast.error("Invalid image URL");
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-bold text-xl">
                      {name ? name.charAt(0).toUpperCase() : 'B'}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold">{name || 'Badge Name'}</h3>
              {description && (
                <p className="text-sm text-gray-500 mt-2 text-center max-w-md">
                  {description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Link to="/badges" className="btn btn-outline">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !name.trim()}
            >
              {loading ? 'Creating...' : 'Create Badge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBadgePage;