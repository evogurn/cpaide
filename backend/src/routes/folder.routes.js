import express from 'express';
import folderController from '../controllers/folder.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validate.js';
import { createFolderSchema, updateFolderSchema, moveFolderSchema, renameFolderSchema } from '../validations/folder.validation.js';
import { requirePermission } from '../middlewares/rbac.js';
import { PERMISSIONS } from '../constants/index.js';

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  validateRequest(createFolderSchema),
  requirePermission([PERMISSIONS.FOLDER_CREATE]),
  folderController.createFolder
);

router.get(
  '/',
  requirePermission([PERMISSIONS.FOLDER_READ]),
  folderController.listFolders
);

router.get(
  '/tree',
  requirePermission([PERMISSIONS.FOLDER_READ]),
  folderController.getFolderTree
);

router.get(
  '/:id',
  requirePermission([PERMISSIONS.FOLDER_READ]),
  folderController.getFolder
);

router.patch(
  '/:id',
  validateRequest(updateFolderSchema),
  requirePermission([PERMISSIONS.FOLDER_UPDATE]),
  folderController.updateFolder
);

router.patch(
  '/:id/rename',
  validateRequest(renameFolderSchema),
  requirePermission([PERMISSIONS.FOLDER_UPDATE]),
  folderController.renameFolder
);

router.post(
  '/:id/move',
  validateRequest(moveFolderSchema),
  requirePermission([PERMISSIONS.FOLDER_UPDATE]),
  folderController.moveFolder
);

router.delete(
  '/:id',
  requirePermission([PERMISSIONS.FOLDER_DELETE]),
  folderController.deleteFolder
);

export default router;
