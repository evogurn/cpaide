import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomSelect from '../components/CustomSelect';
import { folderStructure } from '../data/index';

const UploadDocument = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [folder, setFolder] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();

  // Use imported folder structure
  const folderStructureData = folderStructure;

  // Function to flatten the folder structure and create path labels
  const flattenFolders = (folders, prefix = '') => {
    let flatFolders = [];
    folders.forEach(folder => {
      const path = prefix ? `${prefix} / ${folder.name}` : folder.name;
      flatFolders.push({ id: folder.id, name: folder.name, path });
      
      if (folder.children && folder.children.length > 0) {
        flatFolders = flatFolders.concat(flattenFolders(folder.children, path));
      }
    });
    return flatFolders;
  };

  // Get all folders as flat list with full paths
  const allFolders = flattenFolders(folderStructureData);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Uploading document:', { file, title, description, tags, folder });
    
    // Show success message and redirect
    navigate('/explorer');
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return (
          <div className="h-16 w-16 rounded-md bg-red-100 flex items-center justify-center">
            <span className="text-red-800 font-bold text-xs">PDF</span>
          </div>
        );
      case 'doc':
      case 'docx':
        return (
          <div className="h-16 w-16 rounded-md bg-blue-100 flex items-center justify-center">
            <span className="text-blue-800 font-bold text-xs">DOC</span>
          </div>
        );
      case 'txt':
        return (
          <div className="h-16 w-16 rounded-md bg-green-100 flex items-center justify-center">
            <span className="text-green-800 font-bold text-xs">TXT</span>
          </div>
        );
      case 'ppt':
      case 'pptx':
        return (
          <div className="h-16 w-16 rounded-md bg-yellow-100 flex items-center justify-center">
            <span className="text-yellow-800 font-bold text-xs">PPT</span>
          </div>
        );
      case 'xls':
      case 'xlsx':
        return (
          <div className="h-16 w-16 rounded-md bg-green-100 flex items-center justify-center">
            <span className="text-green-800 font-bold text-xs">XLS</span>
          </div>
        );
      case 'dwg':
        return (
          <div className="h-16 w-16 rounded-md bg-purple-100 flex items-center justify-center">
            <span className="text-purple-800 font-bold text-xs">DWG</span>
          </div>
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
        return (
          <div className="h-16 w-16 rounded-md bg-pink-100 flex items-center justify-center">
            <span className="text-pink-800 font-bold text-xs">IMG</span>
          </div>
        );
      default:
        return (
          <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center">
            <span className="text-gray-800 font-bold text-xs">FILE</span>
          </div>
        );
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Upload Document</h1>
        <p className="mt-1 text-sm text-gray-500">Upload a new construction project document.</p>
      </div>

      <div className="bg-white shadow sm:rounded-lg dark:bg-dark-bg-secondary">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary">Select Document</label>
              <div
                className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                  isDragging ? 'border-accent bg-accent-light' : 'border-gray-300 dark:border-dark-border'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="space-y-1 text-center">
                  {file ? (
                    <div className="flex flex-col items-center">
                      {getFileIcon(file.name)}
                      <div className="mt-4 text-sm text-gray-900">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-accent hover:text-accent-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-accent"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF, DOC, TXT, PPT, XLS, DWG, JPG up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Document Metadata */}
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                  Title
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-accent block w-full sm:text-sm transition-all duration-200 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:placeholder-dark-text-disabled"
                    placeholder="Document title"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-accent block w-full sm:text-sm transition-all duration-200 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:placeholder-dark-text-disabled"
                    placeholder="Brief description of the document"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                  Tags
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="tags"
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-accent block w-full sm:text-sm transition-all duration-200 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:placeholder-dark-text-disabled"
                    placeholder="Comma separated tags"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="folder" className="block text-sm font-medium text-gray-700">
                  Folder
                </label>
                <div className="mt-1">
                  <CustomSelect
                    id="folder"
                    name="folder"
                    value={folder}
                    onChange={setFolder}
                    options={[
                      { value: '', label: 'Select a folder' },
                      ...allFolders.map(f => ({ value: f.id, label: f.path }))
                    ]}
                    placeholder="Select a folder"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/explorer')}
                className=" inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:hover:bg-dark-bg-primary "
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!file}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-accent-contrast focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent ${
                  file
                    ? 'bg-accent hover:bg-accent-dark'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Upload Document
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadDocument;