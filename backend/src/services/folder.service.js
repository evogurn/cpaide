import prisma from '../config/db.js';
import { HTTP_STATUS, ERROR_CODES } from '../constants/index.js';

class FolderService {
  /**
   * Create folder
   */
  async createFolder({ tenantId, name, parentId, ownerId, metadata }) {
    let path = `/${name}`;

    // If parentId provided, calculate path
    if (parentId) {
      const parent = await prisma.folder.findUnique({
        where: { id: parentId },
      });

      if (!parent || parent.tenantId !== tenantId) {
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

    return folder;
  }

  /**
   * Get folder by ID
   */
  async getFolderById(id, tenantId) {
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
    const folder = await prisma.folder.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

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

    return updated;
  }

  /**
   * Rename folder
   */
  async renameFolder(id, tenantId, name) {
    const folder = await prisma.folder.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!folder) {
      const error = new Error('Folder not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    if (name && name !== folder.name) {
      // Check for duplicate name in the same parent folder
      if (folder.parentId) {
        const duplicateFolder = await prisma.folder.findFirst({
          where: {
            parentId: folder.parentId,
            name: name,
            id: { not: id },
            tenantId,
            deletedAt: null,
          },
        });

        if (duplicateFolder) {
          const error = new Error('A folder with this name already exists in the parent folder');
          error.statusCode = HTTP_STATUS.CONFLICT;
          error.code = ERROR_CODES.VALIDATION_ERROR;
          throw error;
        }
      } else {
        // Check for duplicate in root folder
        const duplicateFolder = await prisma.folder.findFirst({
          where: {
            parentId: null,
            name: name,
            id: { not: id },
            tenantId,
            deletedAt: null,
          },
        });

        if (duplicateFolder) {
          const error = new Error('A folder with this name already exists in the root folder');
          error.statusCode = HTTP_STATUS.CONFLICT;
          error.code = ERROR_CODES.VALIDATION_ERROR;
          throw error;
        }
      }

      // Update path
      const newPath = folder.path.replace(new RegExp(`/${folder.name}$`), `/${name}`);
      
      const updated = await prisma.folder.update({
        where: { id },
        data: {
          name,
          path: newPath,
        },
      });

      // Update all children paths
      await this.updateChildrenPaths(folder.path, newPath, tenantId);

      return updated;
    }

    return folder; // Return unchanged if no rename needed
  }

  /**
   * Move folder
   */
  async moveFolder(id, tenantId, targetParentId) {
    const folder = await prisma.folder.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!folder) {
      const error = new Error('Folder not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    let newPath = `/${folder.name}`;

    if (targetParentId) {
      const parent = await prisma.folder.findFirst({
        where: { id: targetParentId, tenantId, deletedAt: null },
      });

      if (!parent) {
        const error = new Error('Target folder not found');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        error.code = ERROR_CODES.NOT_FOUND;
        throw error;
      }

      newPath = `${parent.path}/${folder.name}`;
    }

    // Update folder path
    const updated = await prisma.folder.update({
      where: { id },
      data: {
        parentId: targetParentId,
        path: newPath,
      },
    });

    // Update children paths
    await this.updateChildrenPaths(folder.path, newPath, tenantId);

    return updated;
  }

  /**
   * Delete folder (soft delete)
   */
  async deleteFolder(id, tenantId) {
    const folder = await prisma.folder.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

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
   * Get folder tree structure
   */
  async getFolderTree(tenantId) {
    // Get all folders for the tenant
    const folders = await prisma.folder.findMany({
      where: {
        tenantId,
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
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
        _count: {
          select: {
            documents: true,
            children: true,
          },
        },
      },
    });

    // Build the tree structure
    const folderMap = {};
    const rootFolders = [];

    // First pass: create map of all folders
    folders.forEach(folder => {
      folderMap[folder.id] = {
        ...folder,
        children: [],
      };
    });

    // Second pass: build parent-child relationships
    folders.forEach(folder => {
      if (folder.parentId && folderMap[folder.parentId]) {
        // Add to parent's children
        folderMap[folder.parentId].children.push(folderMap[folder.id]);
      } else {
        // Root folder
        rootFolders.push(folderMap[folder.id]);
      }
    });

    return rootFolders;
  }
}

export default new FolderService();
