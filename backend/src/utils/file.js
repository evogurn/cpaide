import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate unique filename
 */
export const generateUniqueFilename = (originalName) => {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  return `${name}-${timestamp}-${random}${ext}`;
};

/**
 * Get file extension
 */
export const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase().slice(1);
};

/**
 * Validate file type
 */
export const isValidFileType = (mimeType, allowedTypes) => {
  return allowedTypes.includes(mimeType);
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get storage key (S3 path)
 */
export const getStorageKey = (tenantId, filename, documentId, fileType = 'raw') => {
  // Map file types to their appropriate S3 paths
  const filePaths = {
    raw: `tenants/${tenantId}/documents/raw/${documentId}/${filename}`,
    extracted: `tenants/${tenantId}/documents/extracted/${documentId}/${filename}.txt`,
    chunk: `tenants/${tenantId}/documents/chunks/${documentId}/chunk_${Date.now()}.json`,
    embedding: `tenants/${tenantId}/documents/embeddings/${documentId}/embedding_${Date.now()}.json`,
    metadata: `tenants/${tenantId}/documents/raw/${documentId}/metadata.json`
  };
  
  return filePaths[fileType] || filePaths.raw;
};

/**
 * Get tenant-specific prefix for bulk operations
 */
export const getTenantPrefix = (tenantId) => {
  return `tenants/${tenantId}/`;
};

/**
 * Get document-specific prefix
 */
export const getDocumentPrefix = (tenantId, documentId) => {
  return `tenants/${tenantId}/documents/raw/${documentId}/`;
};

/**
 * Get processing stage-specific prefix
 */
export const getProcessingPrefix = (tenantId, documentId, stage) => {
  return `tenants/${tenantId}/documents/${stage}/${documentId}/`;
};
