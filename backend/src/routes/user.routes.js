import express from 'express';
import userController from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validate.js';
import { createUserSchema, updateUserSchema, assignRoleSchema } from '../validations/user.validation.js';
import { requirePermission } from '../middlewares/rbac.js';
import { PERMISSIONS } from '../constants/index.js';

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  validateRequest(createUserSchema),
  requirePermission([PERMISSIONS.USER_CREATE]),
  userController.createUser
);

router.get(
  '/',
  requirePermission([PERMISSIONS.USER_READ]),
  userController.listUsers
);

router.get(
  '/:id',
  requirePermission([PERMISSIONS.USER_READ]),
  userController.getUser
);

router.patch(
  '/:id',
  validateRequest(updateUserSchema),
  requirePermission([PERMISSIONS.USER_UPDATE]),
  userController.updateUser
);

router.delete(
  '/:id',
  requirePermission([PERMISSIONS.USER_DELETE]),
  userController.deleteUser
);

router.post(
  '/:id/roles',
  validateRequest(assignRoleSchema),
  requirePermission([PERMISSIONS.USER_UPDATE]),
  userController.assignRoles
);

export default router;
