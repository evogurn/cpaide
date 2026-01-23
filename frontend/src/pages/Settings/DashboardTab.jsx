import React from 'react';
import { useProjectLabel, useUpdateProjectLabel } from '../../services/projectLabelService';

const DashboardTab = ({ onProjectLabelSave }) => {
  // Use custom hook to fetch project label
  const { data: projectLabel = '', isLoading, isError, error } = useProjectLabel();
  
  // Local state for project label input
  const [projectLabelInput, setProjectLabelInput] = React.useState(projectLabel);
  
  // Update local state when data changes
  React.useEffect(() => {
    setProjectLabelInput(projectLabel);
  }, [projectLabel]);

  // Use custom hook for updating project label
  const { mutate: updateProjectLabel, isPending: isUpdating } = useUpdateProjectLabel(onProjectLabelSave);

  const handleSave = (e) => {
    e.preventDefault();
    // Save project label using mutation
    updateProjectLabel(projectLabelInput);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-dark-text-primary">Dashboard Settings</h3>
        <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <label htmlFor="project-label" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary">
              Project Label
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="project-label"
                id="project-label"
                value={projectLabelInput}
                onChange={(e) => setProjectLabelInput(e.target.value)}
                placeholder="Total Projects"
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-accent block w-full sm:text-sm transition-all duration-200 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:placeholder-dark-text-disabled"
                disabled={isLoading || isUpdating}
              />
              {isLoading && <p className="mt-2 text-sm text-gray-500">Loading...</p>}
              {isError && <p className="mt-2 text-sm text-red-500">Error loading project label: {error?.message}</p>}
              <p className="mt-2 text-sm text-gray-500 dark:text-dark-text-secondary">
                Customize the label for the project metric card on the dashboard. 
                Examples: "Total Clients" for accountants, "Total Homes" for builders.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons for Project Label */}
      <div className="flex justify-end space-x-3 pt-6">
        <button
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-accent-contrast bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          disabled={isUpdating}
        >
          {isUpdating ? 'Saving...' : 'Save Project Label'}
        </button>
      </div>
    </div>
  );
};

export default DashboardTab;