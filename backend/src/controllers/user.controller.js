import userService from '../services/user.service.js';
import { HTTP_STATUS } from '../constants/index.js';
import { successResponse, paginationMeta } from '../utils/response.js';

class UserController {
  async createUser(req, res, next) {
    try {
      const user = await userService.createUser({
        ...req.body,
        tenantId: req.tenantId,
      });
      
      return res.status(HTTP_STATUS.CREATED).json(
        successResponse(user, 'User created', HTTP_STATUS.CREATED)
      );
    } catch (error) {
      next(error);
    }
  }

  async getUser(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      return res.status(HTTP_STATUS.OK).json(successResponse(user, 'User retrieved'));
    } catch (error) {
      next(error);
    }
  }

  async listUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const { users, total } = await userService.listUsers({
        tenantId: req.tenantId,
        page: parseInt(page),
        limit: parseInt(limit),
        status,
      });
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse({
          users,
          pagination: paginationMeta(total, parseInt(page), parseInt(limit)),
        }, 'Users retrieved')
      );
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      return res.status(HTTP_STATUS.OK).json(successResponse(user, 'User updated'));
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      await userService.deleteUser(req.params.id);
      return res.status(HTTP_STATUS.OK).json(successResponse(null, 'User deleted'));
    } catch (error) {
      next(error);
    }
  }

  async assignRoles(req, res, next) {
    try {
      const user = await userService.assignRoles(req.params.id, req.body.roleIds);
      return res.status(HTTP_STATUS.OK).json(successResponse(user, 'Roles assigned'));
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
