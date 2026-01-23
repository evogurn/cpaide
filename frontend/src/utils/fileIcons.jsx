/**
 * Determines the icon type based on MIME type or file extension
 * @param {string} mimeType - The MIME type of the file
 * @param {string} fileName - The name of the file
 * @returns {string} The icon type (e.g., 'pdf', 'doc', 'xls', etc.)
 */
export const getIconType = (mimeType, fileName) => {
  if (!mimeType && !fileName) {
    return 'unknown';
  }

  // First, try to determine from MIME type
  if (mimeType) {
    switch (mimeType.toLowerCase()) {
      case 'application/pdf':
        return 'pdf';
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.template':
      case 'application/vnd.ms-word.document.macroEnabled.12':
      case 'application/vnd.ms-word.template.macroEnabled.12':
        return 'doc';
      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.template':
      case 'application/vnd.ms-excel.sheet.macroEnabled.12':
      case 'application/vnd.ms-excel.template.macroEnabled.12':
      case 'application/vnd.ms-excel.addin.macroEnabled.12':
      case 'application/vnd.ms-excel.sheet.binary.macroEnabled.12':
        return 'xls';
      case 'application/vnd.ms-powerpoint':
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      case 'application/vnd.openxmlformats-officedocument.presentationml.template':
      case 'application/vnd.openxmlformats-officedocument.presentationml.slideshow':
      case 'application/vnd.ms-powerpoint.addin.macroEnabled.12':
      case 'application/vnd.ms-powerpoint.presentation.macroEnabled.12':
      case 'application/vnd.ms-powerpoint.template.macroEnabled.12':
      case 'application/vnd.ms-powerpoint.slideshow.macroEnabled.12':
        return 'ppt';
      case 'text/plain':
        return 'txt';
      case 'text/csv':
        return 'csv';
      case 'application/zip':
      case 'application/x-zip-compressed':
      case 'application/x-7z-compressed':
      case 'application/x-rar-compressed':
        return 'zip';
      case 'image/jpeg':
      case 'image/jpg':
      case 'image/png':
      case 'image/gif':
      case 'image/webp':
        return 'img';
      case 'text/calendar':
        return 'ics';
      case 'application/vnd.dwg':
      case 'image/vnd.dwg':
      case 'application/acad':
      case 'application/autocad_dwg':
        return 'dwg';
      default:
        // If MIME type doesn't match, fall back to file extension
        break;
    }
  }

  // If MIME type didn't match or wasn't provided, use file extension
  if (fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
      case 'docm':
      case 'dot':
      case 'dotx':
      case 'dotm':
        return 'doc';
      case 'xls':
      case 'xlsx':
      case 'xlsm':
      case 'xlsb':
      case 'xltx':
      case 'xltm':
      case 'xlam':
        return 'xls';
      case 'ppt':
      case 'pptx':
      case 'pptm':
      case 'pot':
      case 'potx':
      case 'potm':
      case 'ppam':
      case 'ppsx':
      case 'ppsm':
      case 'sldx':
      case 'sldm':
        return 'ppt';
      case 'txt':
        return 'txt';
      case 'csv':
        return 'csv';
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return 'zip';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
      case 'bmp':
      case 'svg':
        return 'img';
      case 'ics':
        return 'ics';
      case 'dwg':
        return 'dwg';
      default:
        return 'file';
    }
  }

  // Default fallback
  return 'file';
};

import React from 'react';

/**
 * Gets the icon component based on the icon type
 * @param {string} iconType - The icon type (e.g., 'pdf', 'doc', 'xls', etc.)
 * @param {boolean} isDarkMode - Whether to use dark mode styles
 * @param {string} size - Size class for the icon (default: 'h-10 w-10')
 * @returns {JSX.Element} The icon component
 */
export const getFileIcon = (iconType, isDarkMode = false, size = 'h-10 w-10') => {
  const baseClasses = `${size} rounded-md flex items-center justify-center`;
  
  let bgColor, textColor, label;
  
  switch (iconType) {
    case 'pdf':
      bgColor = isDarkMode ? 'bg-red-200' : 'bg-red-100';
      textColor = isDarkMode ? 'text-red-600' : 'text-red-600';
      label = 'PDF';
      break;
    case 'doc':
      bgColor = isDarkMode ? 'bg-blue-200' : 'bg-blue-100';
      textColor = 'text-blue-600';
      label = 'DOC';
      break;
    case 'xls':
      bgColor = isDarkMode ? 'bg-green-900/20' : 'bg-green-100';
      textColor = isDarkMode ? 'text-green-400' : 'text-green-600';
      label = 'XLS';
      break;
    case 'ppt':
      bgColor = isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-100';
      textColor = isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
      label = 'PPT';
      break;
    case 'txt':
      bgColor = isDarkMode ? 'bg-gray-700' : 'bg-gray-100';
      textColor = isDarkMode ? 'text-gray-300' : 'text-gray-600';
      label = 'TXT';
      break;
    case 'csv':
      bgColor = isDarkMode ? 'bg-purple-900/20' : 'bg-purple-100';
      textColor = isDarkMode ? 'text-purple-400' : 'text-purple-600';
      label = 'CSV';
      break;
    case 'zip':
      bgColor = isDarkMode ? 'bg-indigo-900/20' : 'bg-indigo-100';
      textColor = isDarkMode ? 'text-indigo-400' : 'text-indigo-600';
      label = 'ZIP';
      break;
    case 'img':
      bgColor = isDarkMode ? 'bg-pink-900/20' : 'bg-pink-100';
      textColor = isDarkMode ? 'text-pink-400' : 'text-pink-600';
      label = 'IMG';
      break;
    case 'ics':
      bgColor = isDarkMode ? 'bg-teal-900/20' : 'bg-teal-100';
      textColor = isDarkMode ? 'text-teal-400' : 'text-teal-600';
      label = 'ICS';
      break;
    case 'dwg':
      bgColor = isDarkMode ? 'bg-orange-900/20' : 'bg-orange-100';
      textColor = isDarkMode ? 'text-orange-400' : 'text-orange-600';
      label = 'DWG';
      break;
    default:
      bgColor = isDarkMode ? 'bg-gray-700' : 'bg-gray-100';
      textColor = isDarkMode ? 'text-gray-300' : 'text-gray-600';
      label = 'FILE';
  }

  return (
    <div className={`${baseClasses} ${bgColor}`}>
      <span className={`font-bold text-xs ${textColor}`}>{label}</span>
    </div>
  );
};