/**
 * Create Guild page component
 * Form for creating a new guild
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '@/stores/authStore';

const CreateGuildPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Guild name is required');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await api.post('/guilds', {
        name,
        description,
        icon_url: iconUrl
      });
      
      toast.success('Guild created successfully!');
      navigate(`/guilds/${response.data.guild.id}`);
    } catch (error) {
      console.error('Failed to create guild:', error);
      toast.error(error.response?.data?.message || 'Failed to create guild');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-8">
        <Link to="/guilds" className="text-primary-600 mr-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-3xl font-bold">Create a New Guild</h1>
      </div>
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Guild Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter guild name"
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
              placeholder="Describe your guild's purpose and goals"
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
              Enter a URL to an image for your guild's icon
            </p>
          </div>
          
          {/* Icon Preview */}
          <div className="mb-6">
            <p className="block text-sm font-medium text-gray-700 mb-2">
              Preview
            </p>
            <div className="flex items-center">
              {iconUrl ? (
                <img
                  src={iconUrl}
                  alt="Guild icon preview"
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "";
                    toast.error("Invalid image URL");
                  }}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-xl">
                    {name ? name.charAt(0).toUpperCase() : 'G'}
                  </span>
                </div>
              )}
              <div className="ml-4">
                <p className="font-bold">{name || 'Guild Name'}</p>
                <p className="text-sm text-gray-500">
                  {description ? 
                    (description.length > 50 ? description.substring(0, 50) + '...' : description) 
                    : 'Guild description will appear here'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Link to="/guilds" className="btn btn-outline">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !name.trim()}
            >
              {loading ? 'Creating...' : 'Create Guild'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGuildPage;