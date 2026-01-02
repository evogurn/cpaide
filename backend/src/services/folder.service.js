import prisma from '../config/db.js';
import { HTTP_STATUS, ERROR_CODES } from '../constants/index.js';

class FolderService {
  /**
   * Create folder
   */
  async createFolder({ tenantId, name, parentId, ownerId, metadata }) {
    console.log('Creating folder:', { tenantId, name, parentId, ownerId });
    
    // Validate parentId - if it's not a valid UUID format, treat as null (root folder)
    let validParentId = parentId;
    if (parentId && typeof parentId === 'string' && !this.isValidUUID(parentId)) {
      console.log('Invalid parentId provided, treating as root folder:', parentId);
      validParentId = null;
    }
    
    let path = `/${name}`;

    // If valid parentId provided, calculate path
    if (validParentId) {
      console.log('Checking parent folder:', validParentId);
      const parent = await prisma.folder.findUnique({
        where: { id: validParentId, deletedAt: null },
      });

      if (!parent || parent.tenantId !== tenantId) {
        console.log('Parent folder not found or invalid:', { parent, tenantId });
        const error = new Error('Parent folder not found');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        error.code = ERROR_CODES.NOT_FOUND;
        throw error;
      }

      path = `${parent.path}/${name}`;
    }

    const folder = await prisma.folder.create({
      data: {
        tenantId,
        name,
        parentId,
        path,
        ownerId,
        metadata,
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
      },
    });

    console.log('Created folder:', folder);
    return folder;
  }

  /**
   * Get folder by ID
   */
  async getFolderById(id, tenantId) {
    console.log('Getting folder by ID:', { id, tenantId });
    const folder = await prisma.folder.findFirst({
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
        children: {
          where: { deletedAt: null },
        },
        _count: {
          select: {
            documents: true,
            children: true,
          },
        },
      },
    });

    console.log('Found folder:', folder);
    if (!folder) {
      const error = new Error('Folder not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    return folder;
  }

  /**
   * List folders
   */
  async listFolders({ tenantId, parentId = null, page = 1, limit = 50 }) {
    const where = {
      tenantId,
      parentId,
      deletedAt: null,
    };

    const [folders, total] = await Promise.all([
      prisma.folder.findMany({
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
          _count: {
            select: {
              documents: true,
              children: true,
            },
          },
        },
      }),
      prisma.folder.count({ where }),
    ]);

    return { folders, total };
  }

  /**
   * Update folder
   */
  async updateFolder(id, tenantId, data) {
    console.log('Updating folder:', { id, tenantId, data });
    const folder = await prisma.folder.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    console.log('Found folder for update:', folder);
    if (!folder) {
      const error = new Error('Folder not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    // If renaming, update path
    if (data.name && data.name !== folder.name) {
      const newPath = folder.path.replace(new RegExp(`/${folder.name}$`), `/${data.name}`);
      data.path = newPath;

      // Update all children paths
      await this.updateChildrenPaths(folder.path, newPath, tenantId);
    }

    const updated = await prisma.folder.update({
      where: { id },
      data,
    });

    console.log('Updated folder:', updated);
    return updated;
  }

  /**
   * Move folder
   */
  async moveFolder(id, tenantId, targetParentId) {
    console.log('Moving folder:', { id, tenantId, targetParentId });
    const folder = await prisma.folder.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    console.log('Found folder to move:', folder);
    if (!folder) {
      const error = new Error('Folder not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    let newPath = `/${folder.name}`;
    let newParentId = targetParentId;

    if (targetParentId) {
      console.log('Checking target parent folder:', targetParentId);
      const parent = await prisma.folder.findFirst({
        where: { id: targetParentId, tenantId, deletedAt: null },
      });

      if (!parent) {
        console.log('Target parent folder not found:', targetParentId);
        const error = new Error('Target folder not found');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        error.code = ERROR_CODES.NOT_FOUND;
        throw error;
      }

      newPath = `${parent.path}/${folder.name}`;
      newParentId = parent.id;
    }

    // Update folder path
    const updated = await prisma.folder.update({
      where: { id },
      data: {
        parentId: newParentId,
        path: newPath,
      },
    });

    // Update children paths
    await this.updateChildrenPaths(folder.path, newPath, tenantId);

    console.log('Moved folder:', updated);
    return updated;
  }

  /**
   * Delete folder (soft delete)
   */
  async deleteFolder(id, tenantId) {
    console.log('Deleting folder:', { id, tenantId });
    const folder = await prisma.folder.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    console.log('Found folder to delete:', folder);
    if (!folder) {
      const error = new Error('Folder not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    // Soft delete folder and all children
    await prisma.$transaction([
      prisma.folder.updateMany({
        where: {
          OR: [
            { id },
            { path: { startsWith: folder.path + '/' } },
          ],
          tenantId,
        },
        data: { deletedAt: new Date() },
      }),
      prisma.document.updateMany({
        where: { folderId: id, tenantId },
        data: { deletedAt: new Date() },
      }),
    ]);

    console.log('Deleted folder:', id);
    return { message: 'Folder deleted successfully' };
  }

  /**
   * Update children paths recursively
   */
  async updateChildrenPaths(oldPath, newPath, tenantId) {
    const children = await prisma.folder.findMany({
      where: {
        path: { startsWith: oldPath + '/' },
        tenantId,
      },
    });

    for (const child of children) {
      const updatedPath = child.path.replace(oldPath, newPath);
      await prisma.folder.update({
        where: { id: child.id },
        data: { path: updatedPath },
      });
    }
  }

  /**
   * Get all folders for tenant (flat list)
   */
  async getAllFoldersForTenant(tenantId) {
    console.log('Getting all folders for tenant:', tenantId);
    const folders = await prisma.folder.findMany({
      where: {
        tenantId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            documents: true,
            children: true,
          },
        },
      },
    });

    console.log('Found folders for tenant:', tenantId, folders.length);
    return folders;
  }
  
  /**
   * Helper function to validate UUID format
   */
  isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}

export default new FolderService();
