import React, { useState, useRef, useEffect } from "react";
import RestoreDocumentModal from "../components/RestoreDocumentModal";
import DeletePermanentlyModal from "../components/DeletePermanentlyModal";

const RecycleBin = () => {
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDocuments, setSelectedDocuments] = useState([]); // Track selected documents
  const [bulkAction, setBulkAction] = useState(""); // Track bulk action
  const itemsPerPage = 10;

  // Mock data for deleted documents - adding more items to test pagination
  const [deletedDocuments, setDeletedDocuments] = useState([
    {
      id: 1,
      name: "Site Survey - Lot 27.pdf",
      deletedDate: "2023-10-15",
      deletedTime: "14:30",
      deletedBy: "Admin User",
      originalLocation: "City/Community/Lot 27/Custom/Site Survey",
      type: "PDF",
      size: "2.4 MB",
    },
    {
      id: 2,
      name: "Floor Plan - Custom Home.dwg",
      deletedDate: "2023-10-12",
      deletedTime: "09:15",
      deletedBy: "John Doe",
      originalLocation: "City/Community/Lot 27/Custom/Floor Plan",
      type: "DWG",
      size: "5.1 MB",
    },
    {
      id: 3,
      name: "Foundation Inspection Report.pdf",
      deletedDate: "2023-10-10",
      deletedTime: "16:45",
      deletedBy: "Jane Smith",
      originalLocation: "City/Community/Lot 27/Custom/Inspection Reports",
      type: "PDF",
      size: "1.3 MB",
    },
    {
      id: 4,
      name: "HVAC Layout.pdf",
      deletedDate: "2023-10-08",
      deletedTime: "11:20",
      deletedBy: "Admin User",
      originalLocation: "City/Community/Lot 27/Custom/HVAC",
      type: "PDF",
      size: "3.7 MB",
    },
    {
      id: 5,
      name: "Material Specifications.pdf",
      deletedDate: "2023-10-05",
      deletedTime: "13:10",
      deletedBy: "John Doe",
      originalLocation: "City/Community/Lot 27/Custom/Specifications",
      type: "PDF",
      size: "4.2 MB",
    },
    {
      id: 6,
      name: "Electrical Plan.pdf",
      deletedDate: "2023-10-03",
      deletedTime: "15:45",
      deletedBy: "Jane Smith",
      originalLocation: "City/Community/Lot 27/Custom/Electrical",
      type: "PDF",
      size: "2.8 MB",
    },
    {
      id: 7,
      name: "Plumbing Diagram.pdf",
      deletedDate: "2023-10-01",
      deletedTime: "10:30",
      deletedBy: "Admin User",
      originalLocation: "City/Community/Lot 27/Custom/Plumbing",
      type: "PDF",
      size: "3.1 MB",
    },
    {
      id: 8,
      name: "Structural Analysis.docx",
      deletedDate: "2023-09-28",
      deletedTime: "14:15",
      deletedBy: "John Doe",
      originalLocation: "City/Community/Lot 27/Custom/Structural",
      type: "DOC",
      size: "1.9 MB",
    },
    {
      id: 9,
      name: "Building Permit Application.pdf",
      deletedDate: "2023-09-25",
      deletedTime: "09:45",
      deletedBy: "Jane Smith",
      originalLocation: "City/Community/Lot 27/Permits",
      type: "PDF",
      size: "4.5 MB",
    },
    {
      id: 10,
      name: "Zoning Approval.pdf",
      deletedDate: "2023-09-22",
      deletedTime: "16:20",
      deletedBy: "Admin User",
      originalLocation: "City/Community/Lot 27/Permits",
      type: "PDF",
      size: "2.2 MB",
    },
    {
      id: 11,
      name: "Environmental Impact Study.pdf",
      deletedDate: "2023-09-20",
      deletedTime: "11:10",
      deletedBy: "John Doe",
      originalLocation: "City/Community/Lot 27/Environmental",
      type: "PDF",
      size: "6.3 MB",
    },
    {
      id: 12,
      name: "Soil Test Results.pdf",
      deletedDate: "2023-09-18",
      deletedTime: "13:35",
      deletedBy: "Jane Smith",
      originalLocation: "City/Community/Lot 27/Geotechnical",
      type: "PDF",
      size: "3.8 MB",
    },
  ]);

  // Pagination
  const totalPages = Math.ceil(deletedDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDocuments = deletedDocuments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handle individual document selection
  const toggleDocumentSelection = (documentId) => {
    if (selectedDocuments.includes(documentId)) {
      setSelectedDocuments(selectedDocuments.filter(id => id !== documentId));
    } else {
      setSelectedDocuments([...selectedDocuments, documentId]);
    }
  };

  // Handle select all/none for current page
  const toggleSelectAll = () => {
    if (selectedDocuments.length > 0 && paginatedDocuments.every(doc => selectedDocuments.includes(doc.id))) {
      // Deselect all on current page
      const currentPageIds = paginatedDocuments.map(doc => doc.id);
      setSelectedDocuments(selectedDocuments.filter(id => !currentPageIds.includes(id)));
    } else {
      // Select all on current page
      const currentPageIds = paginatedDocuments.map(doc => doc.id);
      const newSelected = [...new Set([...selectedDocuments, ...currentPageIds])];
      setSelectedDocuments(newSelected);
    }
  };

  // Check if all items on current page are selected
  const areAllCurrentPageSelected = paginatedDocuments.length > 0 && 
    paginatedDocuments.every(doc => selectedDocuments.includes(doc.id));
    
  // Check if some items on current page are selected (for indeterminate state)
  const areSomeCurrentPageSelected = paginatedDocuments.length > 0 && 
    paginatedDocuments.some(doc => selectedDocuments.includes(doc.id));

  const handleRestore = (document) => {
    setSelectedDocument(document);
    setRestoreModalOpen(true);
  };

  const handleDeletePermanently = (document) => {
    setSelectedDocument(document);
    setDeleteModalOpen(true);
  };

  // Handle bulk actions
  const handleBulkAction = (action) => {
    setBulkAction(action);
    if (action === "restore") {
      // For bulk restore, we'll show a confirmation with count
      setSelectedDocument({ count: selectedDocuments.length });
      setRestoreModalOpen(true);
    } else if (action === "delete") {
      // For bulk delete, we'll show a confirmation with count
      setSelectedDocument({ count: selectedDocuments.length });
      setDeleteModalOpen(true);
    }
  };

  const confirmRestore = () => {
    if (selectedDocument && selectedDocument.count) {
      // Bulk restore
      console.log("Restoring documents:", selectedDocuments);
      // Filter out restored documents
      setDeletedDocuments(deletedDocuments.filter(doc => !selectedDocuments.includes(doc.id)));
      setSelectedDocuments([]);
    } else {
      // Single restore
      console.log("Restoring document:", selectedDocument);
      // Filter out restored document
      setDeletedDocuments(deletedDocuments.filter(doc => doc.id !== selectedDocument.id));
    }
    setRestoreModalOpen(false);
    setSelectedDocument(null);
  };

  const confirmDeletePermanently = () => {
    if (selectedDocument && selectedDocument.count) {
      // Bulk delete
      console.log("Permanently deleting documents:", selectedDocuments);
      // Filter out deleted documents
      setDeletedDocuments(deletedDocuments.filter(doc => !selectedDocuments.includes(doc.id)));
      setSelectedDocuments([]);
    } else {
      // Single delete
      console.log("Permanently deleting document:", selectedDocument);
      // Filter out deleted document
      setDeletedDocuments(deletedDocuments.filter(doc => doc.id !== selectedDocument.id));
    }
    setDeleteModalOpen(false);
    setSelectedDocument(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">Recycle Bin</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-secondary">
          Recover or permanently delete documents that have been removed.
        </p>
      </div>

      {/* Bulk action toolbar */}
      {selectedDocuments.length > 0 && (
        <div className="bg-gray-200  dark:bg-dark-bg-tertiary p-4 rounded-lg flex items-center justify-between">
          <div className="text-sm font-semibold text-black dark:text-white">
            {selectedDocuments.length} {selectedDocuments.length === 1 ? 'item' : 'items'} selected
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleBulkAction("restore")}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-dark-bg-secondary"
            >
              Restore Selected
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-dark-bg-secondary"
            >
              Delete Permanently
            </button>
          </div>
        </div>
      )}

      {/* Documents table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg dark:bg-dark-bg-secondary">
        {deletedDocuments.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-12">
            <svg
              className="h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-dark-text-primary">
              Recycle bin is empty
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-secondary">
              Documents you delete will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                <thead className="bg-gray-50 dark:bg-dark-bg-tertiary">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary"
                    >
                      <input
                        type="checkbox"
                        checked={areAllCurrentPageSelected}
                        ref={el => {
                          if (el) {
                            el.indeterminate = !areAllCurrentPageSelected && areSomeCurrentPageSelected;
                          }
                        }}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 text-accent rounded border-gray-300 focus:ring-accent dark:bg-dark-bg-secondary dark:border-dark-border"
                      />
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary"
                    >
                      Document
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary"
                    >
                      Time
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary"
                    >
                      By
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-dark-bg-secondary dark:divide-dark-border">
                  {paginatedDocuments.map((document) => (
                    <tr 
                      key={document.id} 
                      className={`hover:bg-gray-50 dark:hover:bg-dark-bg-primary ${
                        selectedDocuments.includes(document.id) ? 'bg-accent-light/20 dark:bg-accent-dark/20' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedDocuments.includes(document.id)}
                          onChange={() => toggleDocumentSelection(document.id)}
                          className="h-4 w-4 text-accent rounded border-gray-300 focus:ring-accent dark:bg-dark-bg-secondary dark:border-dark-border"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {document.type === "PDF" ? (
                              <div className="h-10 w-10 rounded-md bg-red-100 flex items-center justify-center dark:bg-red-900/30">
                                <span className="text-red-800 font-bold text-xs dark:text-red-300">
                                  PDF
                                </span>
                              </div>
                            ) : document.type === "DWG" ? (
                              <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center dark:bg-blue-900/30">
                                <span className="text-blue-800 font-bold text-xs dark:text-blue-300">
                                  DWG
                                </span>
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center dark:bg-gray-700">
                                <span className="text-gray-800 font-bold text-xs dark:text-gray-300">
                                  FILE
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                              {document.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-dark-text-secondary">
                              {document.originalLocation}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                        {document.deletedDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                        {document.deletedTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                        {document.deletedBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleRestore(document)}
                          className="py-1 px-2 rounded-md mr-4 hover:bg-gray-100 dark:hover:bg-dark-bg-primary"
                          title="Restore"
                        >
                          <svg
                            className="h-6 w-6 text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeletePermanently(document)}
                          className="py-1 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-dark-bg-primary"
                          title="Delete Permanently"
                        >
                          <svg
                            className="h-6 w-6 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 dark:bg-dark-bg-secondary dark:border-dark-border">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-dark-bg-tertiary dark:text-dark-text-disabled dark:border-dark-border"
                        : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-dark-bg-secondary dark:text-dark-text-primary dark:border-dark-border dark:hover:bg-dark-bg-primary"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-dark-bg-tertiary dark:text-dark-text-disabled dark:border-dark-border"
                        : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-dark-bg-secondary dark:text-dark-text-primary dark:border-dark-border dark:hover:bg-dark-bg-primary"
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-dark-text-secondary">
                      Showing{" "}
                      <span className="font-medium">{startIndex + 1}</span> to{" "}
                      <span className="font-medium">
                        {Math.min(
                          startIndex + itemsPerPage,
                          deletedDocuments.length
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {deletedDocuments.length}
                      </span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-dark-bg-tertiary dark:text-dark-text-disabled dark:border-dark-border"
                            : "bg-white text-gray-500 hover:bg-gray-50 dark:bg-dark-bg-secondary dark:text-dark-text-secondary dark:border-dark-border dark:hover:bg-dark-bg-primary"
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      {/* Page numbers */}
                      {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNum
                                ? "z-10 bg-accent border-accent text-accent-contrast dark:bg-accent dark:border-accent dark:text-accent-contrast"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-dark-bg-secondary dark:border-dark-border dark:text-dark-text-secondary dark:hover:bg-dark-bg-primary"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                          currentPage === totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-dark-bg-tertiary dark:text-dark-text-disabled dark:border-dark-border"
                            : "bg-white text-gray-500 hover:bg-gray-50 dark:bg-dark-bg-secondary dark:text-dark-text-secondary dark:border-dark-border dark:hover:bg-dark-bg-primary"
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Restore Document Modal */}
      {restoreModalOpen && (
        <RestoreDocumentModal
          document={selectedDocument}
          onClose={() => setRestoreModalOpen(false)}
          onConfirm={confirmRestore}
        />
      )}

      {/* Delete Permanently Modal */}
      {deleteModalOpen && (
        <DeletePermanentlyModal
          document={selectedDocument}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDeletePermanently}
        />
      )}
    </div>
  );
};

export default RecycleBin;