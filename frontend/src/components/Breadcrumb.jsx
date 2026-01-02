import React from 'react';

const Breadcrumb = ({ path, onFolderSelect }) => {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {path.map((item, index) => (
          <li key={item.id} className="flex items-center">
            {index > 0 && (
              <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
            <button
              onClick={() => onFolderSelect(item.id)}
              className={`ml-2 text-sm font-medium ${
                index === path.length - 1 
                  ? 'text-gray-900' 
                  : 'text-accent hover:text-accent-dark'
              }`}
            >
              {item.name}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;