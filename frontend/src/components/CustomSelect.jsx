import React, { useState, useRef, useEffect } from 'react';

const CustomSelect = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  error = false,
  className = '',
  searchable = false,
  multiSelect = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef(null);
  const listRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsOpen(true);
        }
      } else {
        if (e.key === 'Escape') {
          setIsOpen(false);
          setHighlightedIndex(-1);
          setSearchTerm('');
          selectRef.current?.focus();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        } else if (e.key === 'Enter' && highlightedIndex >= 0) {
          e.preventDefault();
          handleOptionSelect(filteredOptions[highlightedIndex].value);
        }
      }
    };

    const selectElement = selectRef.current;
    if (selectElement) {
      selectElement.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (selectElement) {
        selectElement.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [isOpen, highlightedIndex, options]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const optionElement = listRef.current.children[highlightedIndex];
      if (optionElement) {
        optionElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Filter options based on search term
  const filteredOptions = searchable 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const handleOptionSelect = (selectedValue) => {
    if (multiSelect) {
      const newValue = Array.isArray(value) 
        ? value.includes(selectedValue)
          ? value.filter(v => v !== selectedValue)
          : [...value, selectedValue]
        : [selectedValue];
      onChange(newValue);
    } else {
      onChange(selectedValue);
      setIsOpen(false);
      setHighlightedIndex(-1);
      setSearchTerm('');
      selectRef.current?.focus();
    }
  };

  const selectedOption = multiSelect
    ? options.filter(option => Array.isArray(value) && value.includes(option.value))
    : options.find(option => option.value === value);

  const displayValue = multiSelect
    ? Array.isArray(selectedOption) && selectedOption.length > 0
      ? selectedOption.map(opt => opt.label).join(', ')
      : placeholder
    : selectedOption
      ? selectedOption.label
      : placeholder;

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {/* Select Trigger */}
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-2 text-left bg-white border rounded-lg shadow-sm
          flex items-center justify-between focus:outline-none transition-all
          ${error 
            ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:border-red-500 dark:focus:ring-red-500 dark:focus:border-red-500' 
            : 'border-gray-300 focus:ring-2 focus:ring-accent-light focus:border-accent dark:border-dark-border'
          }
          ${disabled 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-dark-bg-primary dark:text-dark-text-disabled' 
            : 'hover:border-gray-400 cursor-pointer dark:bg-dark-bg-tertiary dark:text-dark-text-primary'
          }
        `}
        {...props}
      >
        <span className={`${displayValue === placeholder ? 'text-gray-500 dark:text-dark-text-disabled' : 'text-gray-900 dark:text-dark-text-primary'}`}>
          {displayValue}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 dark:text-dark-text-secondary ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <div 
          ref={listRef}
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-hidden transition-all duration-200 dark:bg-dark-bg-secondary dark:border-dark-border"
        >
          {searchable && (
            <div className="p-2 border-b border-gray-200 dark:border-dark-border">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-accent transition-all duration-200 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:placeholder-dark-text-disabled"
                placeholder="Search..."
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-dark-text-secondary">No options found</div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={multiSelect 
                    ? Array.isArray(value) && value.includes(option.value)
                    : option.value === value
                  }
                  onClick={() => handleOptionSelect(option.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`
                    px-4 py-2 cursor-pointer transition-colors duration-150 flex items-center
                    ${multiSelect && Array.isArray(value) && value.includes(option.value)
                      ? 'bg-accent-light text-accent-contrast dark:bg-accent-dark'
                      : option.value === value
                        ? 'bg-accent-light text-accent-contrast dark:bg-accent-dark'
                        : highlightedIndex === index
                          ? 'bg-gray-100 dark:bg-dark-bg-primary'
                          : 'text-gray-700 hover:bg-gray-50 dark:text-dark-text-primary dark:hover:bg-dark-bg-primary'
                    }
                  `}
                >
                  {multiSelect && (
                    <input
                      type="checkbox"
                      checked={Array.isArray(value) ? value.includes(option.value) : false}
                      onChange={() => {}}
                      className="mr-2 h-4 w-4 text-accent rounded focus:ring-accent dark:bg-dark-bg-tertiary dark:border-dark-border"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;