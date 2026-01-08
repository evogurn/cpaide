import prisma from '../config/db.js';
import { HTTP_STATUS } from '../constants/index.js';
import { successResponse } from '../utils/response.js';

class LoginHistoryController {
  /**
   * Get login history for a tenant
   */
  async getLoginHistory(req, res, next) {
    try {
      const tenantId = req.tenantId;
      const { userId, page = 1, limit = 10, startDate, endDate, status } = req.query;

      // Build where clause
      let whereClause = {
        tenantId: tenantId,
      };

      if (userId) {
        whereClause.userId = userId;
      }

      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) {
          whereClause.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          // Set endDate to end of the day (23:59:59) to include all entries from that day
          const endDateObj = new Date(endDate);
          endDateObj.setHours(23, 59, 59, 999);
          whereClause.createdAt.lte = endDateObj;
        }
      }

      if (status) {
        whereClause.loginStatus = status;
      }

      // Get total count for pagination
      const totalCount = await prisma.loginHistory.count({
        where: whereClause,
      }).catch(error => {
        console.error('Error counting login history:', error);
        throw error;
      });

      // Get login history with pagination
      const loginHistory = await prisma.loginHistory.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return res.status(HTTP_STATUS.OK).json(
        successResponse({
          data: loginHistory,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalCount,
            pages: Math.ceil(totalCount / parseInt(limit)),
          },
        }, 'Login history retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get login history for current user
   */
  async getUserLoginHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, startDate, endDate, status } = req.query;

      // Build where clause
      let whereClause = {
        userId: userId,
      };

      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) {
          whereClause.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          // Set endDate to end of the day (23:59:59) to include all entries from that day
          const endDateObj = new Date(endDate);
          endDateObj.setHours(23, 59, 59, 999);
          whereClause.createdAt.lte = endDateObj;
        }
      }

      if (status) {
        whereClause.loginStatus = status;
      }

      // Get total count for pagination
      const totalCount = await prisma.loginHistory.count({
        where: whereClause,
      }).catch(error => {
        console.error('Error counting login history:', error);
        throw error;
      });

      // Get login history with pagination
      const loginHistory = await prisma.loginHistory.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return res.status(HTTP_STATUS.OK).json(
        successResponse({
          data: loginHistory,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalCount,
            pages: Math.ceil(totalCount / parseInt(limit)),
          },
        }, 'User login history retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new LoginHistoryController();