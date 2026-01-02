import React, { useState, useEffect } from 'react';
import * as featureSliderService from '../services/featureSliderService';

const FeatureSliderManager = () => {
  const [slides, setSlides] = useState([]);

  // Load slides from settings on component mount
  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      const savedSlides = await featureSliderService.getFeatureSlides();
      if (savedSlides.length > 0) {
        setSlides(savedSlides);
      } else {
        // Default slides if none are saved
        const defaultSlides = [
          {
            id: 1,
            title: "Secure Digital Document Storage",
            description: "Store all your important documents securely in the cloud with enterprise-grade encryption and access controls for maximum protection.",
            icon: "lock",
            image: "",
            enabled: true,
            order: 1
          },
          {
            id: 2,
            title: "Smart Search and Tagging",
            description: "Find documents instantly with AI-powered search and intelligent tagging systems that categorize your content automatically.",
            icon: "search",
            image: "",
            enabled: true,
            order: 2
          },
          {
            id: 3,
            title: "Team Collaboration & Access Control",
            description: "Collaborate seamlessly with your team while maintaining granular control over who can access, edit, or share documents.",
            icon: "users",
            image: "",
            enabled: true,
            order: 3
          }
        ];
        setSlides(defaultSlides);
        // Save default slides
        await featureSliderService.saveFeatureSlides(defaultSlides);
      }
    } catch (error) {
      console.error('Failed to load slides:', error);
    }
  };

  const addSlide = async () => {
    try {
      const newSlideData = {
        title: "New Slide",
        description: "Slide description",
        icon: "document",
        image: "",
        enabled: true
      };
      
      const newSlide = await featureSliderService.createFeatureSlide(newSlideData);
      setSlides([...slides, newSlide]);
    } catch (error) {
      console.error('Failed to add slide:', error);
    }
  };

  const updateSlide = async (id, updatedSlide) => {
    try {
      const slide = await featureSliderService.updateFeatureSlide(id, updatedSlide);
      setSlides(slides.map(s => s.id === id ? slide : s));
    } catch (error) {
      console.error('Failed to update slide:', error);
    }
  };

  const removeSlide = async (id) => {
    try {
      await featureSliderService.deleteFeatureSlide(id);
      setSlides(slides.filter(slide => slide.id !== id));
    } catch (error) {
      console.error('Failed to remove slide:', error);
    }
  };

  const toggleSlide = async (id) => {
    try {
      const slide = await featureSliderService.toggleFeatureSlide(id);
      setSlides(slides.map(s => s.id === id ? slide : s));
    } catch (error) {
      console.error('Failed to toggle slide:', error);
    }
  };

  const moveSlide = async (id, direction) => {
    const slideIndex = slides.findIndex(s => s.id === id);
    if (slideIndex === -1) return;

    const newSlides = [...slides];
    if (direction === 'up' && slideIndex > 0) {
      // Swap with previous slide
      [newSlides[slideIndex], newSlides[slideIndex - 1]] = [newSlides[slideIndex - 1], newSlides[slideIndex]];
      // Update order values
      newSlides[slideIndex].order = slideIndex + 1;
      newSlides[slideIndex - 1].order = slideIndex;
    } else if (direction === 'down' && slideIndex < newSlides.length - 1) {
      // Swap with next slide
      [newSlides[slideIndex], newSlides[slideIndex + 1]] = [newSlides[slideIndex + 1], newSlides[slideIndex]];
      // Update order values
      newSlides[slideIndex].order = slideIndex + 1;
      newSlides[slideIndex + 1].order = slideIndex + 2;
    }
    
    try {
      // Get slide IDs in new order
      const slideIds = newSlides.map(s => s.id);
      const reorderedSlides = await featureSliderService.reorderFeatureSlides(slideIds);
      setSlides(reorderedSlides);
    } catch (error) {
      console.error('Failed to reorder slides:', error);
      // Revert to previous state if API fails
      setSlides(slides);
    }
  };

  // Sort slides by order
  const sortedSlides = [...slides].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-dark-text-primary">Feature Slider</h3>
        <button
          type="button"
          onClick={addSlide}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
        >
          <svg className="-ml-1 mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Slide
        </button>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 dark:bg-dark-bg-tertiary">
        {sortedSlides.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-dark-text-primary">No slides</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-secondary">Get started by adding a new slide.</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={addSlide}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Slide
              </button>
            </div>
          </div>
        ) : (
          <ul className="space-y-4">
            {sortedSlides.map((slide) => (
              <li key={slide.id} className="bg-white shadow rounded-lg p-4 dark:bg-dark-bg-secondary">
                <div className="flex items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
                        className="text-lg font-medium text-gray-900 dark:text-dark-text-primary bg-transparent border-b border-transparent focus:border-gray-300 focus:outline-none w-full"
                        placeholder="Slide title"
                      />
                      <div className="ml-4 flex items-center">
                        <button
                          onClick={() => toggleSlide(slide.id)}
                          className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent ${
                            slide.enabled ? 'bg-accent' : 'bg-gray-200 dark:bg-dark-border'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                              slide.enabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className="ml-2 text-sm text-gray-500 dark:text-dark-text-secondary">
                          {slide.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <textarea
                        value={slide.description}
                        onChange={(e) => updateSlide(slide.id, { description: e.target.value })}
                        rows={3}
                        className="mt-1 block w-full text-sm text-gray-500 dark:text-dark-text-secondary bg-transparent border border-transparent rounded-md focus:border-gray-300 focus:outline-none focus:ring-0"
                        placeholder="Slide description"
                      />
                    </div>
                    
                    <div className="mt-3 grid grid-cols-1 gap-y-3 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                          Icon
                        </label>
                        <div className="mt-1">
                          <select
                            value={slide.icon}
                            onChange={(e) => updateSlide(slide.id, { icon: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-accent block w-full sm:text-sm transition-all duration-200 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                          >
                            <option value="lock">Lock</option>
                            <option value="search">Search</option>
                            <option value="users">Users</option>
                            <option value="document">Document</option>
                            <option value="folder">Folder</option>
                            <option value="cloud">Cloud</option>
                            <option value="share">Share</option>
                            <option value="chart">Chart</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                          Image (optional)
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            value={slide.image}
                            onChange={(e) => updateSlide(slide.id, { image: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-accent block w-full sm:text-sm transition-all duration-200 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                            placeholder="Image URL"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex flex-col space-y-2">
                    <button
                      onClick={() => moveSlide(slide.id, 'up')}
                      disabled={slide.order === 1}
                      className={`p-1 rounded-md ${
                        slide.order === 1 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-dark-text-secondary dark:hover:text-dark-text-primary dark:hover:bg-dark-bg-primary'
                      }`}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => moveSlide(slide.id, 'down')}
                      disabled={slide.order === sortedSlides.length}
                      className={`p-1 rounded-md ${
                        slide.order === sortedSlides.length 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-dark-text-secondary dark:hover:text-dark-text-primary dark:hover:bg-dark-bg-primary'
                      }`}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => removeSlide(slide.id)}
                      className="p-1 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FeatureSliderManager;