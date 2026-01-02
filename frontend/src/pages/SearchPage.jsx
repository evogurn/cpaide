import React, { useState } from 'react';
import DocumentPreviewModal from '../components/DocumentPreviewModal';
import CustomSelect from '../components/CustomSelect';
import { searchDocuments, documentTags } from '../data/index';

const SearchPage = () => {
  const [activeTab, setActiveTab] = useState('ai'); // 'file' or 'ai'
  const [searchTerm, setSearchTerm] = useState('');
  const [fileType, setFileType] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortOption, setSortOption] = useState('relevance');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiMessages, setAiMessages] = useState([
    { id: 1, type: 'ai', content: 'Hello! I\'m your AI assistant. How can I help you find construction documents today?' },
  ]);
  const [fileSearchResults, setFileSearchResults] = useState([]);
  const [aiSearchResults, setAiSearchResults] = useState([]);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Use imported mock data
  const mockDocuments = searchDocuments;

  // Use imported tags
  const allTags = documentTags;

  const handleFileSearch = (e) => {
    e.preventDefault();
    
    // Simple search implementation
    let results = mockDocuments;
    
    if (searchTerm) {
      results = results.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (fileType) {
      results = results.filter(doc => doc.type === fileType);
    }
    
    if (selectedTags.length > 0) {
      results = results.filter(doc => 
        selectedTags.every(tag => doc.tags.includes(tag))
      );
    }
    
    // Apply sorting
    if (sortOption === 'latest') {
      results.sort((a, b) => new Date(b.modified) - new Date(a.modified));
    } else if (sortOption === 'oldest') {
      results.sort((a, b) => new Date(a.modified) - new Date(b.modified));
    }
    
    setFileSearchResults(results);
  };

  const handleAiSearch = (e) => {
    e.preventDefault();
    
    if (!aiQuestion.trim()) return;
    
    // Add user question to chat
    const newUserMessage = {
      id: aiMessages.length + 1,
      type: 'user',
      content: aiQuestion
    };
    
    setAiMessages(prev => [...prev, newUserMessage]);
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponse = {
        id: aiMessages.length + 2,
        type: 'ai',
        content: `I found several construction documents related to "${aiQuestion}". Here are the most relevant results:`
      };
      
      setAiMessages(prev => [...prev, aiResponse]);
      
      // Set AI search results
      const relevantDocs = mockDocuments.filter(doc => 
        doc.name.toLowerCase().includes(aiQuestion.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(aiQuestion.toLowerCase())) ||
        doc.snippet.toLowerCase().includes(aiQuestion.toLowerCase())
      ).slice(0, 3);
      
      setAiSearchResults(relevantDocs);
    }, 1000);
    
    setAiQuestion('');
  };

  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleDocumentClick = (document) => {
    setSelectedDocument(document);
    setPreviewModalOpen(true);
  };

  const getFileIcon = (iconType) => {
    switch (iconType) {
      case 'pdf':
        return (
          <div className="h-10 w-10 rounded-md bg-red-100 flex items-center justify-center">
            <span className="text-red-800 font-bold text-xs">PDF</span>
          </div>
        );
      case 'doc':
        return (
          <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
            <span className="text-blue-800 font-bold text-xs">DWG</span>
          </div>
        );
      case 'txt':
        return (
          <div className="h-10 w-10 rounded-md bg-green-100 flex items-center justify-center">
            <span className="text-green-800 font-bold text-xs">TXT</span>
          </div>
        );
      case 'ppt':
        return (
          <div className="h-10 w-10 rounded-md bg-yellow-100 flex items-center justify-center">
            <span className="text-yellow-800 font-bold text-xs">PPT</span>
          </div>
        );
      case 'xls':
        return (
          <div className="h-10 w-10 rounded-md bg-green-100 flex items-center justify-center">
            <span className="text-green-800 font-bold text-xs">XLS</span>
          </div>
        );
      case 'zip':
        return (
          <div className="h-10 w-10 rounded-md bg-purple-100 flex items-center justify-center">
            <span className="text-purple-800 font-bold text-xs">ZIP</span>
          </div>
        );
      default:
        return (
          <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
            <span className="text-gray-800 font-bold text-xs">FILE</span>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Construction Document Search</h1>
        <p className="mt-1 text-sm text-gray-500">Find construction documents using traditional filters or ask our AI assistant for help.</p>
      </div>

      <div className="flex flex-1 overflow-hidden bg-white rounded-lg shadow dark:bg-dark-bg-secondary">
        {/* Left Side: Search Mode Tabs */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col dark:border-dark-border">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 dark:border-dark-border">
            <button
              className={`flex-1 py-4 px-6 text-center font-medium text-sm ${
                activeTab === 'ai'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary'
              }`}
              onClick={() => setActiveTab('ai')}
            >
              AI Search
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-medium text-sm ${
                activeTab === 'file'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary'
              }`}
              onClick={() => setActiveTab('file')}
            >
              File Search
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'ai' ? (
              // AI Search Tab
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {aiMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-accent-light ml-4 dark:bg-accent-dark'
                          : 'bg-gray-50 mr-4 dark:bg-dark-bg-tertiary'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-accent flex items-center justify-center text-accent-contrast text-xs font-bold">
                          {message.type === 'user' ? 'U' : 'AI'}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                            {message.type === 'user' ? 'You' : 'AI Assistant'}
                          </p>
                          <p className="mt-1 text-sm text-gray-700 dark:text-dark-text-primary">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAiSearch} className="mt-auto">
                  <div className="flex">
                    <input
                      type="text"
                      value={aiQuestion}
                      onChange={(e) => setAiQuestion(e.target.value)}
                      placeholder="Ask me anything about your construction documents..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-accent transition-all duration-200 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:placeholder-dark-text-disabled"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-accent text-accent-contrast rounded-r-md hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              // File Search Tab
              <div className="space-y-6">
                <form onSubmit={handleFileSearch} className="space-y-6">
                  <div>
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                      Search
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="search"
                        id="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-accent block w-full sm:text-sm transition-all duration-200 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:placeholder-dark-text-disabled"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="file-type" className="block text-sm font-medium text-gray-700">
                      File Type
                    </label>
                    <div className="mt-1">
                      <CustomSelect
                        id="file-type"
                        name="file-type"
                        value={fileType}
                        onChange={setFileType}
                        options={[
                          { value: '', label: 'All Types' },
                          { value: 'PDF', label: 'PDF' },
                          { value: 'DWG', label: 'DWG' },
                          { value: 'XLSX', label: 'Excel' },
                          { value: 'ZIP', label: 'ZIP Archive' }
                        ]}
                        placeholder="Select file type"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="date-range" className="block text-sm font-medium text-gray-700">
                      Date Range
                    </label>
                    <div className="mt-1">
                      <CustomSelect
                        id="date-range"
                        name="date-range"
                        value={dateRange}
                        onChange={setDateRange}
                        options={[
                          { value: '', label: 'Any Time' },
                          { value: 'today', label: 'Today' },
                          { value: 'week', label: 'This Week' },
                          { value: 'month', label: 'This Month' },
                          { value: 'year', label: 'This Year' }
                        ]}
                        placeholder="Select date range"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Popular Tags
                    </label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {allTags.slice(0, 12).map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagToggle(tag)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            selectedTags.includes(tag)
                              ? 'bg-accent-light text-accent-contrast'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="sort" className="block text-sm font-medium text-gray-700">
                      Sort By
                    </label>
                    <div className="mt-1">
                      <CustomSelect
                        id="sort"
                        name="sort"
                        value={sortOption}
                        onChange={setSortOption}
                        options={[
                          { value: 'relevance', label: 'Relevance' },
                          { value: 'latest', label: 'Latest' },
                          { value: 'oldest', label: 'Oldest' }
                        ]}
                        placeholder="Sort by"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-accent-contrast bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                    >
                      Search Construction Documents
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Search Results Panel */}
        <div className="w-2/3 overflow-y-auto p-6 dark:bg-dark-bg-secondary">
          <h2 className="text-lg font-medium text-gray-900 mb-4 dark:text-dark-text-primary">
            {activeTab === 'ai' ? 'AI Search Results' : 'Construction Document Results'}
          </h2>

          {activeTab === 'ai' ? (
            // AI Search Results
            <div className="space-y-6">
              {aiSearchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Ask me a question</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Ask about construction documents like "Show me all foundation inspection reports" or "Find electrical layouts for Lot 27".
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-accent-light rounded-lg p-4">
                    <h3 className="text-sm font-medium text-accent">AI Response</h3>
                    <p className="mt-1 text-sm text-accent-contrast">
                      Based on your query, I found these relevant construction documents:
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {aiSearchResults.map((document) => (
                      <div 
                        key={document.id} 
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 dark:border-border-color dark:hover:bg-surface-hover"
                        onClick={() => handleDocumentClick(document)}
                      >
                        <div className="flex items-start">
                          {getFileIcon(document.icon)}
                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium text-gray-900">{document.name}</h3>
                              <p className="text-sm text-gray-500">{document.size}</p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">{document.type} • Modified {document.modified}</p>
                            <p className="mt-2 text-sm text-gray-700 line-clamp-2">{document.snippet}</p>
                            <div className="mt-3 flex flex-wrap gap-1">
                              {document.tags.map((tag) => (
                                <span 
                                  key={tag} 
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent-light text-accent-contrast"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            // File Search Results
            fileSearchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No construction documents found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Try adjusting your search terms or filters. Search for terms like "foundation", "blueprint", or "inspection".
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {fileSearchResults.map((document) => (
                  <div 
                    key={document.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 dark:border-border-color dark:hover:bg-surface-hover"
                    onClick={() => handleDocumentClick(document)}
                  >
                    <div className="flex items-start">
                      {getFileIcon(document.icon)}
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">{document.name}</h3>
                          <p className="text-sm text-gray-500">{document.size}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{document.type} • Modified {document.modified}</p>
                        <p className="mt-2 text-sm text-gray-700 line-clamp-2">{document.snippet}</p>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {document.tags.map((tag) => (
                            <span 
                              key={tag} 
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent-light text-accent-contrast"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewModalOpen && (
        <DocumentPreviewModal 
          document={selectedDocument} 
          onClose={() => setPreviewModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default SearchPage;