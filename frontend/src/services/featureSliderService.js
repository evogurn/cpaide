import api from '../utils/api';
import { getSetting, setSetting } from '../utils/settingsUtils';

/**
 * Feature Slider Service
 * Handles CRUD operations for feature slider slides
 * Designed to work with both localStorage and API backend
 */

// Default slides to show when none are configured
const DEFAULT_SLIDES = [
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

// API endpoints
const ENDPOINTS = {
  GET_SLIDES: '/feature-slider/slides',
  GET_ENABLED_SLIDES: '/feature-slider/slides/enabled',
  CREATE_SLIDE: '/feature-slider/slides',
  UPDATE_SLIDE: (id) => `/feature-slider/slides/${id}`,
  DELETE_SLIDE: (id) => `/feature-slider/slides/${id}`,
  REORDER_SLIDES: '/feature-slider/slides/reorder'
};

/**
 * Get feature slider slides
 * First tries to get from API, falls back to localStorage
 * Returns default slides if none are found
 * @returns {Promise<Array>} Array of slide objects
 */
export const getFeatureSlides = async () => {
  try {
    // Try to get from API first
    const response = await api.get(ENDPOINTS.GET_SLIDES);
    const slides = response.data.data;
    
    // Save to localStorage as backup
    setSetting('featureSlider.slides', slides);
    return slides;
  } catch (error) {
    // Fallback to localStorage if API fails
    console.warn('Failed to fetch feature slides from API, using localStorage:', error);
    const slides = getSetting('featureSlider.slides', []);
    
    // Return default slides if none are found in localStorage
    if (slides.length === 0) {
      // Save default slides to localStorage for future use
      setSetting('featureSlider.slides', DEFAULT_SLIDES);
      return DEFAULT_SLIDES;
    }
    
    return slides;
  }
};

/**
 * Get enabled feature slider slides
 * First tries to get from API, falls back to localStorage
 * Returns default slides if none are found
 * @returns {Promise<Array>} Array of enabled slide objects
 */
export const getEnabledFeatureSlides = async () => {
  try {
    // Try to get from API first
    const response = await api.get(ENDPOINTS.GET_ENABLED_SLIDES);
    const slides = response.data.data;
    
    // Save to localStorage as backup
    setSetting('featureSlider.slides', slides);
    return slides;
  } catch (error) {
    // Fallback to localStorage if API fails
    console.warn('Failed to fetch enabled feature slides from API, using localStorage:', error);
    const slides = getSetting('featureSlider.slides', []);
    
    // Filter and return only enabled slides
    const enabledSlides = slides.filter(slide => slide.enabled);
    
    // Return default slides if no enabled slides are found
    if (enabledSlides.length === 0) {
      return DEFAULT_SLIDES.filter(slide => slide.enabled);
    }
    
    return enabledSlides;
  }
};

/**
 * Save feature slider slides
 * Tries to save to API, also saves to localStorage as backup
 * @param {Array} slides - Array of slide objects
 * @returns {Promise<boolean>} Success status
 */
export const saveFeatureSlides = async (slides) => {
  try {
    // Save to localStorage as backup
    setSetting('featureSlider.slides', slides);
    
    // Try to save to API
    const response = await api.post(ENDPOINTS.CREATE_SLIDE, { slides });
    return response.data.success;
  } catch (error) {
    console.error('Failed to save feature slides to API:', error);
    // Even if API fails, we still have localStorage
    return true;
  }
};

/**
 * Create a new feature slide
 * @param {Object} slideData - Slide data to create
 * @returns {Promise<Object>} Created slide object
 */
export const createFeatureSlide = async (slideData) => {
  try {
    // Create slide via API
    const response = await api.post(ENDPOINTS.CREATE_SLIDE, slideData);
    const newSlide = response.data.data;
    
    // Update localStorage
    const slides = await getFeatureSlides();
    const updatedSlides = [...slides, newSlide];
    setSetting('featureSlider.slides', updatedSlides);
    
    return newSlide;
  } catch (error) {
    console.error('Failed to create feature slide:', error);
    throw error;
  }
};

/**
 * Update an existing feature slide
 * @param {string} slideId - ID of slide to update
 * @param {Object} slideData - Updated slide data
 * @returns {Promise<Object>} Updated slide object
 */
export const updateFeatureSlide = async (slideId, slideData) => {
  try {
    // Update slide via API
    const response = await api.put(ENDPOINTS.UPDATE_SLIDE(slideId), slideData);
    const updatedSlide = response.data.data;
    
    // Update localStorage
    const slides = await getFeatureSlides();
    const updatedSlides = slides.map(slide => 
      slide.id === slideId ? updatedSlide : slide
    );
    setSetting('featureSlider.slides', updatedSlides);
    
    return updatedSlide;
  } catch (error) {
    console.error('Failed to update feature slide:', error);
    throw error;
  }
};

/**
 * Delete a feature slide
 * @param {string} slideId - ID of slide to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteFeatureSlide = async (slideId) => {
  try {
    // Delete slide via API
    await api.delete(ENDPOINTS.DELETE_SLIDE(slideId));
    
    // Update localStorage
    const slides = await getFeatureSlides();
    const updatedSlides = slides.filter(slide => slide.id !== slideId);
    setSetting('featureSlider.slides', updatedSlides);
    
    return true;
  } catch (error) {
    console.error('Failed to delete feature slide:', error);
    throw error;
  }
};

/**
 * Toggle slide enabled status
 * @param {string} slideId - ID of slide to toggle
 * @returns {Promise<Object>} Updated slide object
 */
export const toggleFeatureSlide = async (slideId) => {
  try {
    // Get existing slide
    const slides = await getFeatureSlides();
    const slide = slides.find(s => s.id === slideId);
    
    if (!slide) {
      throw new Error('Slide not found');
    }
    
    // Toggle enabled status
    const updatedSlideData = { ...slide, enabled: !slide.enabled };
    
    // Update via API
    const response = await api.put(ENDPOINTS.UPDATE_SLIDE(slideId), updatedSlideData);
    const updatedSlide = response.data.data;
    
    // Update localStorage
    const updatedSlides = slides.map(s => 
      s.id === slideId ? updatedSlide : s
    );
    setSetting('featureSlider.slides', updatedSlides);
    
    return updatedSlide;
  } catch (error) {
    console.error('Failed to toggle feature slide:', error);
    throw error;
  }
};

/**
 * Reorder feature slides
 * @param {Array} slideIds - Array of slide IDs in new order
 * @returns {Promise<Array>} Updated slides array
 */
export const reorderFeatureSlides = async (slideIds) => {
  try {
    // Reorder via API
    const response = await api.post(ENDPOINTS.REORDER_SLIDES, { slideIds });
    const reorderedSlides = response.data.data;
    
    // Update localStorage
    setSetting('featureSlider.slides', reorderedSlides);
    
    return reorderedSlides;
  } catch (error) {
    console.error('Failed to reorder feature slides:', error);
    throw error;
  }
};

export default {
  getFeatureSlides,
  saveFeatureSlides,
  createFeatureSlide,
  updateFeatureSlide,
  deleteFeatureSlide,
  toggleFeatureSlide,
  reorderFeatureSlides,
  getEnabledFeatureSlides
};