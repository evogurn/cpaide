import React from 'react';

const InputField = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error = false,
  errorMessage = '',
  className = '',
  showPasswordToggle = false,
  showPassword = false,
  setShowPassword = null,
  suffix = null,
  ...props
}) => {
  // Base classes for all inputs with dark mode support
  const baseClasses = "px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:placeholder-dark-text-disabled";
  
  // Error classes
  const errorClasses = "border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-500 dark:focus:ring-red-500 dark:focus:border-red-500";
  
  // Textarea needs additional padding
  const textareaClasses = "py-3";
  
  // Combine classes based on type and error state
  const getInputClasses = () => {
    let classes = `w-full ${baseClasses}`;
    
    if (error) {
      classes += ` ${errorClasses}`;
    }
    
    if (type === 'textarea') {
      classes += ` ${textareaClasses}`;
    }
    
    return classes;
  };

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1 dark:text-dark-text-primary">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {type === 'textarea' ? (
          <textarea
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={getInputClasses()}
            {...props}
          />
        ) : (
          <div className="relative">
            <input
              id={id}
              type={type === 'password' && showPassword ? 'text' : type}
              value={value}
              onChange={onChange}
              onBlur={props.onBlur}
              placeholder={placeholder}
              required={required}
              className={`${getInputClasses()} ${suffix ? 'pr-24' : ''}`}
              {...props}
            />
            {suffix && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 dark:text-dark-text-secondary text-sm">
                  {suffix}
                </span>
              </div>
            )}
            {type === 'password' && showPasswordToggle && (
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-dark-text-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            )}
          </div>
        )}
      </div>
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </div>
  );
};

export default InputField;