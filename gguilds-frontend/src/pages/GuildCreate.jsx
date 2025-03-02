// src/pages/GuildCreate.js
// A form for creating new guilds with various options
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const GuildCreate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [guildName, setGuildName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  
  // UI state
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Available tags for guilds
  const availableTags = [
    'Gaming', 'Technology', 'Art', 'Music', 'Writing',
    'Education', 'Science', 'Sports', 'Social', 'Business',
    'Development', 'Design', 'Health', 'Food', 'Travel'
  ];
  
  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle tag selection toggle
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      // Limit to 5 tags
      if (selectedTags.length < 5) {
        setSelectedTags([...selectedTags, tag]);
      }
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error
    setError('');
    
    // Validate form
    if (!guildName.trim()) {
      setError('Guild name is required');
      return;
    }
    
    if (guildName.length < 3 || guildName.length > 50) {
      setError('Guild name must be between 3 and 50 characters');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call to create the guild
      // For now, we'll simulate an API call
      
      // Prepare guild data
      const guildData = {
        name: guildName.trim(),
        description: description.trim(),
        isPublic,
        tags: selectedTags,
        createdBy: user.id,
        // The avatar would be uploaded to storage and the URL stored
        // For now, we'll skip that
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful guild creation
      const mockGuildResponse = {
        id: 'g' + Date.now(), // Generate a fake ID
        ...guildData,
        createdAt: new Date().toISOString(),
        memberCount: 1, // Creator is the first member
      };
      
      // Navigate to the new guild page
      navigate(`/guilds/${mockGuildResponse.id}`);
      
    } catch (error) {
      console.error('Error creating guild:', error);
      setError('Failed to create guild. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create a New Guild</h1>
      
      {/* Display errors if any */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        {/* Guild Avatar */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Guild Avatar
          </label>
          <div className="flex items-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden mr-4 flex items-center justify-center">
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Guild avatar preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              )}
            </div>
            <div>
              <input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <label
                htmlFor="avatar"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded cursor-pointer block text-center"
              >
                Upload Image
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Recommended size: 200x200 pixels
              </p>
            </div>
          </div>
        </div>
        
        {/* Guild Name */}
        <div className="mb-4">
          <label htmlFor="guildName" className="block text-sm font-medium text-gray-700 mb-1">
            Guild Name *
          </label>
          <input
            id="guildName"
            type="text"
            value={guildName}
            onChange={(e) => setGuildName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            maxLength={50}
            required
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            {guildName.length}/50 characters
          </p>
        </div>
        
        {/* Guild Description */}
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={4}
            maxLength={500}
            disabled={isLoading}
          ></textarea>
          <p className="text-xs text-gray-500 mt-1">
            {description.length}/500 characters
          </p>
        </div>
        
        {/* Privacy Setting */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Privacy Setting
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={isPublic}
                onChange={() => setIsPublic(true)}
                className="mr-2"
                disabled={isLoading}
              />
              <div>
                <div className="font-medium">Public</div>
                <div className="text-sm text-gray-500">Anyone can find and request to join your guild</div>
              </div>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={!isPublic}
                onChange={() => setIsPublic(false)}
                className="mr-2"
                disabled={isLoading}
              />
              <div>
                <div className="font-medium">Private</div>
                <div className="text-sm text-gray-500">Only people with a direct link can find your guild</div>
              </div>
            </label>
          </div>
        </div>
        
        {/* Guild Tags */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Guild Tags (Select up to 5)
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                key={tag}
                type="button"
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedTags.includes(tag) 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                onClick={() => toggleTag(tag)}
                disabled={isLoading || (!selectedTags.includes(tag) && selectedTags.length >= 5)}
              >
                {tag}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {selectedTags.length}/5 tags selected
          </p>
        </div>
        
        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Guild...' : 'Create Guild'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GuildCreate;