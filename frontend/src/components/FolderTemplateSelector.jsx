import React, { useState, useEffect } from 'react';
import folderTemplateService from '../services/folderTemplateService';

const FolderTemplateSelector = ({ onApplyTemplate }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [placeholderValues, setPlaceholderValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [industries, setIndustries] = useState([]);

  useEffect(() => {
    if (isModalOpen) {
      loadIndustries();
    }
  }, [isModalOpen]);

  const loadIndustries = async () => {
    try {
      setIsLoading(true);
      setError(null); // Clear any previous errors
      // Get unique industries from all templates
      console.log('Fetching all templates...');
      const allTemplates = await folderTemplateService.getAllTemplates();
      console.log('API Response:', allTemplates);
      
      if (!allTemplates.success) {
        throw new Error('API request failed');
      }
      
      const templates = allTemplates.data?.templates || [];
      console.log('Raw templates data:', allTemplates.data);
      console.log('Templates:', templates);
      const uniqueIndustries = [...new Set(templates.map(t => t.industry).filter(industry => industry && typeof industry === 'string' && industry.trim() !== ''))].map(industry => industry.trim());
      console.log('Unique industries:', uniqueIndustries);
      setIndustries(uniqueIndustries);
    } catch (err) {
      setError('Failed to load industries: ' + err.message);
      console.error('Error loading industries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplatesByIndustry = async (industry) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await folderTemplateService.getTemplatesByIndustry(industry);
      setTemplates(response.data || []);
      setSelectedTemplate(null);
      setPlaceholderValues({});
    } catch (err) {
      setError('Failed to load templates');
      console.error('Error loading templates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    // Initialize placeholder values based on template nodes
    const initialValues = {};
    template.nodes.forEach(node => {
      if (node.isPlaceholder) {
        // Extract placeholder names from the node name (e.g., {ProjectName} -> projectname)
        const placeholders = node.name.match(/\{([^}]+)\}/g);
        if (placeholders) {
          placeholders.forEach(placeholder => {
            const cleanPlaceholder = placeholder.replace(/[{}]/g, '');
            initialValues[cleanPlaceholder] = '';
          });
        }
      }
    });
    setPlaceholderValues(initialValues);
  };

  const handlePlaceholderChange = (placeholderName, value) => {
    setPlaceholderValues(prev => ({
      ...prev,
      [placeholderName]: value
    }));
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setIsLoading(true);
      setError(null);
      
      await folderTemplateService.applyTemplateToTenant(selectedTemplate.id, placeholderValues);
      
      onApplyTemplate && onApplyTemplate(selectedTemplate);
      setIsModalOpen(false);
      setSelectedTemplate(null);
      setPlaceholderValues({});
      setTemplates([]);
    } catch (err) {
      setError('Failed to apply template');
      console.error('Error applying template:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setTemplates([]);
    setSelectedTemplate(null);
    setPlaceholderValues({});
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTemplates([]);
    setSelectedTemplate(null);
    setPlaceholderValues({});
    setError(null);
  };

  return (
    <>
      <button
        onClick={openModal}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Apply Template
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Apply Folder Template</h2>
                <button
                  type="button"
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

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Industry Selection */}
                <div className="lg:col-span-1">
                  <h3 className="text-lg font-semibold mb-3">Select Industry</h3>
                  {isLoading && !industries.length ? (
                    <div className="text-center py-4">Loading...</div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {industries && Array.isArray(industries) ? (
                        industries.map(industry => (
                          <button
                            type="button"
                            key={industry}
                            onClick={() => loadTemplatesByIndustry(industry)}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors border"
                          >
                            {industry}
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">No industries available</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Template Selection */}
                <div className="lg:col-span-1">
                  <h3 className="text-lg font-semibold mb-3">Select Template</h3>
                  {isLoading && !templates.length ? (
                    <div className="text-center py-4">Loading...</div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {templates && Array.isArray(templates) ? (
                        templates.map(template => (
                          <div
                            key={template.id}
                            onClick={() => handleTemplateSelect(template)}
                            className={`p-3 rounded-lg cursor-pointer border ${
                              selectedTemplate?.id === template.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-gray-600">{template.description}</p>
                            <div className="mt-2 text-xs text-gray-500">
                              {template.nodes?.length || 0} nodes
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">No templates available</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Template Preview and Placeholders */}
                <div className="lg:col-span-1">
                  <h3 className="text-lg font-semibold mb-3">Configure & Preview</h3>
                  {selectedTemplate ? (
                    <div>
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">{selectedTemplate.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{selectedTemplate.description}</p>
                        
                        {/* Placeholder Inputs */}
                        {Object.keys(placeholderValues).length > 0 && (
                          <div className="mb-4">
                            <h5 className="font-medium mb-2">Fill in placeholders:</h5>
                            {Object.entries(placeholderValues).map(([key, value]) => (
                              <div key={key} className="mb-2">
                                <label className="block text-sm font-medium mb-1">
                                  {key}:
                                </label>
                                <input
                                  type="text"
                                  value={value}
                                  onChange={(e) => handlePlaceholderChange(key, e.target.value)}
                                  placeholder={`Enter ${key}`}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Template Structure Preview */}
                        <div>
                          <h5 className="font-medium mb-2">Template Structure:</h5>
                          <div className="text-xs bg-white p-2 rounded border max-h-32 overflow-y-auto">
                            {selectedTemplate.nodes
                              .filter(node => node.level === 0) // Show root nodes
                              .map(node => (
                                <div key={node.id} className="ml-2">
                                  <span className="text-blue-600">📁</span> {node.name}
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={handleApplyTemplate}
                        disabled={isLoading}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Applying...' : 'Apply Template'}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Select a template to configure
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FolderTemplateSelector;