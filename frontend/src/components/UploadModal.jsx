import React, { useState } from "react";
import CustomSelect from "./CustomSelect";
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } from '../utils/toastUtils';

const UploadModal = ({ folders, onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [uploadFolder, setUploadFolder] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Function to get all folders with their paths for the dropdown
  const getAllFoldersWithPaths = (folderArray, prefix = "") => {
    let result = [];
    folderArray.forEach((folder) => {
      const path = prefix ? `${prefix} / ${folder.name}` : folder.name;
      result.push({ id: folder.id, name: path });
      if (folder.children && folder.children.length > 0) {
        result = result.concat(getAllFoldersWithPaths(folder.children, path));
      }
    });
    return result;
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !uploadFolder) return;

    // Show loading toast
    const toastId = showLoadingToast('Uploading document...');

    try {
      await onUpload({
        file,
        title: title || file.name,
        description,
        tags,
        folderId: uploadFolder,
      });

      // Dismiss loading toast and show success
      dismissToast(toastId);
      showSuccessToast(`"${title || file.name}" uploaded successfully!`);

      // Reset form
      setFile(null);
      setTitle("");
      setDescription("");
      setTags("");
      setUploadFolder("");
      onClose();
    } catch (error) {
      // Dismiss loading toast and show error
      dismissToast(toastId);
      showErrorToast(`Failed to upload "${title || file.name}". Please try again.`);
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf":
        return (
          <div className="h-16 w-16 rounded-md bg-red-100 flex items-center justify-center">
            <span className="text-red-800 font-bold text-xs">PDF</span>
          </div>
        );
      case "doc":
      case "docx":
        return (
          <div className="h-16 w-16 rounded-md bg-blue-100 flex items-center justify-center">
            <span className="text-blue-800 font-bold text-xs">DOC</span>
          </div>
        );
      case "txt":
        return (
          <div className="h-16 w-16 rounded-md bg-green-100 flex items-center justify-center">
            <span className="text-green-800 font-bold text-xs">TXT</span>
          </div>
        );
      case "ppt":
      case "pptx":
        return (
          <div className="h-16 w-16 rounded-md bg-yellow-100 flex items-center justify-center">
            <span className="text-yellow-800 font-bold text-xs">PPT</span>
          </div>
        );
      case "xls":
      case "xlsx":
        return (
          <div className="h-16 w-16 rounded-md bg-green-100 flex items-center justify-center">
            <span className="text-green-800 font-bold text-xs">XLS</span>
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div
            className="absolute inset-0 bg-gray-500 opacity-75"
            onClick={onClose}
          ></div>
        </div>

        {/* Modal container */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full dark:bg-dark-bg-secondary">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 dark:bg-dark-bg-secondary">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-dark-text-primary">
                  Upload Document
                </h3>
                <div className="mt-2">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* File Upload Area */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                        Select Document
                      </label>
                      <div
                        className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                          isDragging
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 dark:border-dark-border"
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
                                <p className="text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
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
                                  htmlFor="file-upload-modal"
                                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                >
                                  <span>Upload a file</span>
                                  <input
                                    id="file-upload-modal"
                                    name="file-upload-modal"
                                    type="file"
                                    className="sr-only"
                                    onChange={handleFileChange}
                                  />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">
                                PDF, DOC, TXT, PPT, XLS up to 10MB
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Document Metadata */}
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-6">
                        <label
                          htmlFor="title"
                          className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary"
                        >
                          Title
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="title"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 block w-full sm:text-sm transition-all duration-200 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:placeholder-dark-text-disabled"
                            placeholder="Document title"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-6">
                        <label
                          htmlFor="description"
                          className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary"
                        >
                          Description
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="description"
                            name="description"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 block w-full sm:text-sm transition-all duration-200 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:placeholder-dark-text-disabled"
                            placeholder="Brief description of the document"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label
                          htmlFor="tags"
                          className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary"
                        >
                          Tags
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="tags"
                            id="tags"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 block w-full sm:text-sm transition-all duration-200 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:placeholder-dark-text-disabled"
                            placeholder="Comma separated tags"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label
                          htmlFor="upload-folder"
                          className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary"
                        >
                          Select Upload Destination Folder
                        </label>
                        <div className="mt-1">
                          <CustomSelect
                            id="upload-folder"
                            name="upload-folder"
                            value={uploadFolder}
                            onChange={setUploadFolder}
                            options={getAllFoldersWithPaths(folders).map(
                              (f) => ({
                                value: f.id,
                                label: f.name,
                              })
                            )}
                            placeholder="Select a folder"
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse dark:bg-dark-bg-tertiary">
            <button
              type="button"
              disabled={!file || !uploadFolder}
              onClick={handleSubmit}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-accent-contrast focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent sm:ml-3 sm:w-auto sm:text-sm ${
                file && uploadFolder
                  ? "bg-accent hover:bg-accent-dark"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Upload Document
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border dark:hover:bg-dark-bg-primary"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
