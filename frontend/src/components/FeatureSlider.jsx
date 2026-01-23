import React, { useState, useEffect } from 'react';
import * as featureSliderService from '../services/featureSliderService';

// Helper function to render icons based on icon name
const renderIcon = (iconName) => {
  const iconClass = "w-16 h-16 text-accent";
  
  switch (iconName) {
    case 'lock':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    case 'search':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      );
    case 'users':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case 'document':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'folder':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      );
    case 'cloud':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      );
    case 'share':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      );
    case 'chart':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
  }
};

const FeatureSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState('right');
  const [slideAnimation, setSlideAnimation] = useState('');
  const [slides, setSlides] = useState([]);

  // Load slides from settings or use defaults
  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      const enabledSlides = await featureSliderService.getEnabledFeatureSlides();
      setSlides(enabledSlides);
    } catch (error) {
      console.error('Failed to load feature slides:', error);
      // This should never happen now since the service always returns defaults
    }
  };

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    
    const interval = setInterval(() => {
      setDirection('right');
      setSlideAnimation('slide-right');
      setTimeout(() => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        setSlideAnimation('');
      }, 1000);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  // Handle manual slide change
  const goToSlide = (index) => {
    if (index !== currentSlide && slides.length > 1) {
      setDirection(index > currentSlide ? 'right' : 'left');
      setSlideAnimation(index > currentSlide ? 'slide-right' : 'slide-left');
      setTimeout(() => {
        setCurrentSlide(index);
        setSlideAnimation('');
      }, 1000);
    }
  };

  // Always render slides - removed the condition that showed fallback message
  return (
    <div className="h-full flex flex-col justify-center items-center p-8 bg-gradient-to-br from-accent/20 to-accent-dark/20 dark:from-dark-bg-tertiary dark:to-dark-bg-primary">
      <div className="max-w-md text-center flex flex-col items-center justify-center h-full w-full">
        {/* Animated Icon */}
        <div className="flex justify-center mb-6 relative h-20 w-full overflow-hidden">
          <div 
            className={`absolute inset-0 flex justify-center items-center ${
              slideAnimation === 'slide-right' ? 'animate-slideInRight' : 
              slideAnimation === 'slide-left' ? 'animate-slideInLeft' : ''
            }`}
          >
            {renderIcon(slides[currentSlide]?.icon || 'document')}
          </div>
        </div>
        
        {/* Animated Title and Description */}
        <div className="mb-6 w-full overflow-hidden">
          <div 
            className={`w-full ${
              slideAnimation === 'slide-right' ? 'animate-slideInRight' : 
              slideAnimation === 'slide-left' ? 'animate-slideInLeft' : ''
            }`}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
              {slides[currentSlide]?.title || "Slide Title"}
            </h2>
            <p className="text-gray-700 dark:text-dark-text-secondary text-center">
              {slides[currentSlide]?.description || "Slide description"}
            </p>
          </div>
        </div>
        
        {/* Navigation bars */}
        {slides.length > 1 && (
          <div className="flex justify-center space-x-2 mb-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1 w-12 rounded transition-colors duration-300 ${
                  index === currentSlide 
                    ? 'bg-accent dark:bg-accent-light' 
                    : 'bg-gray-300 dark:bg-dark-border'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
        
        {/* Additional PNG at the bottom */}
        <div className="">
          <img 
            src={slides[currentSlide]?.image || "/assets/slider.png"} 
            alt="Feature illustration" 
            className="max-w-full h-auto"
            onError={(e) => {
              e.target.src = "/assets/slider.png";
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FeatureSlider;