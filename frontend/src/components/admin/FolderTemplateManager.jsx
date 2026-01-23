import React, { useState, useEffect } from 'react';
import folderTemplateService from '../../services/folderTemplateService';

const FolderTemplateManager = () => {
  const [templates, setTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    description: '',
    isSystem: false,
    nodes: [
      { name: 'Root', level: 0, position: 0, isPlaceholder: false, metadata: null }
    ]
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await folderTemplateService.getAllTemplates();
      
      console.log('API Response:', response); // Debug log
      
      // Handle the response based on its actual structure
      if (response && response.success === true) {
        // Templates are in response.data
        if (response.data && Array.isArray(response.data.templates)) {
          setTemplates(response.data.templates);
        } else {
          console.error('Templates array not found in response.data:', response);
          setError('Failed to load templates: Templates array not found');
        }
      } else {
        console.error('Invalid API response:', response);
        setError('Failed to load templates: Invalid response format');
      }
    } catch (err) {
      setError('Failed to load templates: ' + (err.message || 'Unknown error'));
      console.error('Error loading templates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNodeChange = (index, field, value) => {
    setFormData(prev => {
      const newNodes = [...prev.nodes];
      newNodes[index] = {
        ...newNodes[index],
        [field]: value
      };
      return { ...prev, nodes: newNodes };
    });
  };

  const addNode = () => {
    setFormData(prev => ({
      ...prev,
      nodes: [
        ...prev.nodes,
        {
          name: `Folder ${prev.nodes.length + 1}`,
          level: 0,
          position: prev.nodes.length,
          isPlaceholder: false,
          metadata: null
        }
      ]
    }));
  };

  const removeNode = (index) => {
    setFormData(prev => ({
      ...prev,
      nodes: prev.nodes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      
      if (isEditing) {
        await folderTemplateService.updateTemplate(editingTemplate.id, formData);
      } else {
        await folderTemplateService.createTemplate(formData);
      }
      
      loadTemplates();
      closeModal();
    } catch (err) {
      setError('Failed to save template');
      console.error('Error saving template:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      industry: template.industry,
      description: template.description,
      isSystem: template.isSystem,
      nodes: template.nodes
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        setIsLoading(true);
        await folderTemplateService.deleteTemplate(id);
        loadTemplates();
      } catch (err) {
        setError('Failed to delete template');
        console.error('Error deleting template:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const openModal = () => {
    setFormData({
      name: '',
      industry: '',
      description: '',
      isSystem: false,
      nodes: [
        { name: 'Root', level: 0, position: 0, isPlaceholder: false, metadata: null }
      ]
    });
    setIsEditing(false);
    setEditingTemplate(null);
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: '',
      industry: '',
      description: '',
      isSystem: false,
      nodes: [
        { name: 'Root', level: 0, position: 0, isPlaceholder: false, metadata: null }
      ]
    });
    setIsEditing(false);
    setEditingTemplate(null);
    setError(null);
  };

  const filteredTemplates = templates?.filter(template => {
    const matchesSearch = template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = !selectedIndustry || template.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  }) || [];

  const industries = templates ? [...new Set(templates.map(t => t.industry).filter(industry => industry))] : [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Folder Template Manager</h1>
        <button
          onClick={openModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Template
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <select
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Industries</option>
          {industries.map(industry => (
            <option key={industry} value={industry}>{industry}</option>
          ))}
        </select>
      </div>

      {/* Templates List */}
      {isLoading && !templates.length ? (
        <div className="text-center py-8">Loading templates...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => (
            <div key={template.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{template.name || 'Untitled'}</h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  template.isSystem ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {(template.isSystem || false) ? 'System' : 'Custom'}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{template.description || ''}</p>
              
              <div className="text-xs text-gray-500 mb-3">
                <div>Industry: {template.industry || 'N/A'}</div>
                <div>{template.nodes?.length || 0} nodes</div>
                <div>Created: {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'N/A'}</div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(template)}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {isEditing ? 'Edit Template' : 'Create Template'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Industry *</label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isSystem}
                        onChange={(e) => handleInputChange('isSystem', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Is System Template</span>
                    </label>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">Template Structure</h3>
                    <button
                      type="button"
                      onClick={addNode}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                    >
                      Add Node
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.nodes.map((node, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">Folder Name *</label>
                            <input
                              type="text"
                              value={node.name}
                              onChange={(e) => handleNodeChange(index, 'name', e.target.value)}
                              required
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Level</label>
                            <input
                              type="number"
                              value={node.level}
                              onChange={(e) => handleNodeChange(index, 'level', parseInt(e.target.value))}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Position</label>
                            <input
                              type="number"
                              value={node.position}
                              onChange={(e) => handleNodeChange(index, 'position', parseInt(e.target.value))}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          
                          <div>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={node.isPlaceholder}
                                onChange={(e) => handleNodeChange(index, 'isPlaceholder', e.target.checked)}
                                className="mr-2"
                              />
                              <span className="text-sm">Is Placeholder</span>
                            </label>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => removeNode(index)}
                            className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Saving...' : isEditing ? 'Update Template' : 'Create Template'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderTemplateManager;