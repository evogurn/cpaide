import prisma from '../config/db.js';
import { HTTP_STATUS, ERROR_CODES } from '../constants/index.js';
import { generateUniqueFilename, getStorageKey } from '../utils/file.js';
import crypto from 'crypto';

class DocumentService {
  /**
   * Create document metadata
   */
  async createDocument({ tenantId, folderId, ownerId, name, originalName, mimeType, size, tags, metadata, storageKey }) {
    // Generate checksum
    const checksum = crypto.randomBytes(32).toString('hex'); // Placeholder

    const document = await prisma.document.create({
      data: {
        tenantId,
        folderId,
        ownerId,
        name: name || originalName,
        originalName,
        mimeType,
        size: BigInt(size),
        storageKey,
        checksum,
        tags: tags || [],
        metadata,
        status: 'PENDING',
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
            path: true,
          },
        },
      },
    });

    return document;
  }

  /**
   * Get document by ID
   */
  async getDocumentById(id, tenantId) {
    const document = await prisma.document.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
            path: true,
          },
        },
      },
    });

    if (!document) {
      const error = new Error('Document not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    return {
      ...document,
      size: Number(document.size), // Convert BigInt to Number for JSON
    };
  }

  /**
   * List documents
   */
  async listDocuments({ tenantId, folderId, status, tags, page = 1, limit = 20 }) {
    const where = { tenantId, deletedAt: null };
    
    if (folderId) where.folderId = folderId;
    if (status) where.status = status;
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          folder: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.document.count({ where }),
    ]);

    // Convert BigInt to Number
    const formattedDocuments = documents.map(doc => ({
      ...doc,
      size: Number(doc.size),
    }));

    return { documents: formattedDocuments, total };
  }

  /**
   * Search documents
   */
  async searchDocuments({ tenantId, query, folderId, tags, status, page = 1, limit = 20 }) {
    const where = { tenantId, deletedAt: null };
    
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { extractedText: { contains: query, mode: 'insensitive' } },
      ];
    }
    
    if (folderId) where.folderId = folderId;
    if (status) where.status = status;
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          folder: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.document.count({ where }),
    ]);

    const formattedDocuments = documents.map(doc => ({
      ...doc,
      size: Number(doc.size),
    }));

    return { documents: formattedDocuments, total };
  }

  /**
   * Update document
   */
  async updateDocument(id, tenantId, data) {
    const document = await prisma.document.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!document) {
      const error = new Error('Document not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    const updated = await prisma.document.update({
      where: { id },
      data,
    });

    return updated;
  }

  /**
   * Move document to another folder
   */
  async moveDocument(id, tenantId, targetFolderId) {
    const document = await prisma.document.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!document) {
      const error = new Error('Document not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    // Verify target folder exists
    if (targetFolderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: targetFolderId, tenantId, deletedAt: null },
      });

      if (!folder) {
        const error = new Error('Target folder not found');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        error.code = ERROR_CODES.NOT_FOUND;
        throw error;
      }
    }

    const updated = await prisma.document.update({
      where: { id },
      data: { folderId: targetFolderId },
    });

    return updated;
  }

  /**
   * Delete document (soft delete)
   */
  async deleteDocument(id, tenantId) {
    const document = await prisma.document.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!document) {
      const error = new Error('Document not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    await prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Document deleted successfully' };
  }

  /**
   * Restore document
   */
  async restoreDocument(id, tenantId) {
    const document = await prisma.document.findFirst({
      where: { id, tenantId },
    });

    if (!document) {
      const error = new Error('Document not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    const restored = await prisma.document.update({
      where: { id },
      data: { deletedAt: null, status: 'READY' },
    });

    return restored;
  }

  /**
   * Update document status
   */
  async updateStatus(id, status, extractedText = null) {
    const data = { status };
    if (extractedText) {
      data.extractedText = extractedText;
    }

    const document = await prisma.document.update({
      where: { id },
      data,
    });

    return document;
  }
}

export default new DocumentService();
