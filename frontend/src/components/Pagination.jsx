import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems }) => {
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);
  
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };
  
  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };
  
  return (
    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 dark:border-dark-border">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${
            currentPage === 1 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-dark-bg-tertiary dark:text-dark-text-secondary dark:border-dark-border' 
              : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-dark-bg-secondary dark:text-dark-text-primary dark:hover:bg-dark-bg-primary'
          }`}
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${
            currentPage === totalPages 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-dark-bg-tertiary dark:text-dark-text-secondary dark:border-dark-border' 
              : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-dark-bg-secondary dark:text-dark-text-primary dark:hover:bg-dark-bg-primary'
          }`}
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700 dark:text-dark-text-primary">
            Showing <span className="font-medium">{startIndex}</span> to <span className="font-medium">{endIndex}</span> of{' '}
            <span className="font-medium">{totalItems}</span> results
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                currentPage === 1 
                  ? 'cursor-not-allowed dark:bg-dark-bg-tertiary dark:text-dark-text-secondary dark:ring-dark-border' 
                  : 'dark:bg-dark-bg-secondary dark:text-dark-text-primary dark:hover:bg-dark-bg-primary dark:ring-dark-border'
              }`}
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* Page numbers */}
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => onPageChange(pageNumber)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    currentPage === pageNumber
                      ? 'z-10 bg-accent text-accent-contrast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:bg-accent dark:text-accent-contrast'
                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0 dark:text-dark-text-primary dark:ring-dark-border dark:hover:bg-dark-bg-primary'
                  } ${pageNumber === 1 ? 'rounded-l-md' : ''} ${pageNumber === totalPages ? 'rounded-r-md' : ''}`}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                currentPage === totalPages 
                  ? 'cursor-not-allowed dark:bg-dark-bg-tertiary dark:text-dark-text-secondary dark:ring-dark-border' 
                  : 'dark:bg-dark-bg-secondary dark:text-dark-text-primary dark:hover:bg-dark-bg-primary dark:ring-dark-border'
              }`}
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;