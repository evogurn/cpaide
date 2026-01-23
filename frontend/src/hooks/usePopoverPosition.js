import { useState, useEffect } from 'react';

const usePopoverPosition = (triggerRef, popoverRef, isVisible) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isVisible || !triggerRef.current || !popoverRef.current) return;

    const updatePosition = () => {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const popoverRect = popoverRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let top = triggerRect.bottom + window.scrollY + 5; // 5px gap
      let left = triggerRect.left + window.scrollX;

      // Adjust horizontal position if popover overflows right edge
      if (left + popoverRect.width > windowWidth) {
        left = windowWidth - popoverRect.width - 10; // 10px margin
      }

      // Adjust horizontal position if popover overflows left edge
      if (left < 10) {
        left = 10; // 10px margin
      }

      // Adjust vertical position if popover overflows bottom edge
      if (top + popoverRect.height > windowHeight + window.scrollY) {
        top = triggerRect.top + window.scrollY - popoverRect.height - 5; // Position above if needed
      }

      // On mobile screens, try to center the popover
      if (windowWidth < 768) {
        left = Math.max(10, (windowWidth - popoverRect.width) / 2);
      }

      setPosition({ top, left });
    };

    updatePosition();
    
    // Add event listeners for window resize and scroll
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, { passive: true });

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isVisible, triggerRef, popoverRef]);

  return position;
};

export default usePopoverPosition;