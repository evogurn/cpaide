import prisma from '../config/db.js';
import { hashPassword } from '../utils/bcrypt.js';
import { HTTP_STATUS, ERROR_CODES } from '../constants/index.js';

class UserService {
  /**
   * Create a new user
   */
  async createUser({ tenantId, email, password, firstName, lastName, roleIds = [] }) {
    // Check if user exists
    const existing = await prisma.user.findFirst({
      where: { tenantId, email, deletedAt: null },
    });

    if (existing) {
      const error = new Error('Email already exists');
      error.statusCode = HTTP_STATUS.CONFLICT;
      error.code = ERROR_CODES.EMAIL_ALREADY_EXISTS;
      throw error;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        tenantId,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        status: 'ACTIVE',
      },
    });

    // Assign roles
    if (roleIds.length > 0) {
      await this.assignRoles(user.id, roleIds);
    } else {
      // Assign default USER role
      const defaultRole = await prisma.role.findUnique({
        where: { name: 'USER' },
      });
      if (defaultRole) {
        await prisma.userRole.create({
          data: { userId: user.id, roleId: defaultRole.id },
        });
      }
    }

    return await this.getUserById(user.id);
  }

  /**
   * Get user by ID
   */
  async getUserById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        tenantId: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        status: true,
        emailVerified: true,
        phone: true,
        phoneVerified: true,
        alternativePhone: true,
        timeZone: true,
        address: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        tenant: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || user.deletedAt) {
      const error = new Error('User not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    return user;
  }

  /**
   * List users
   */
  async listUsers({ tenantId, page = 1, limit = 10, status }) {
    const where = { tenantId, deletedAt: null };
    if (status) where.status = status;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          userRoles: {
            include: { role: true },
          },
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          userRoles: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  /**
   * Update user
   */
  async updateUser(id, data) {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        status: true,
        emailVerified: true,
        phone: true,
        phoneVerified: true,
        alternativePhone: true,
        timeZone: true,
        address: true,
        userRoles: {
          include: { role: true },
        },
      },
    });

    return user;
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(id) {
    const user = await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return user;
  }

  /**
   * Assign roles to user
   */
  async assignRoles(userId, roleIds) {
    // Remove existing roles
    await prisma.userRole.deleteMany({
      where: { userId },
    });

    // Assign new roles
    const userRoles = roleIds.map(roleId => ({
      userId,
      roleId,
    }));

    await prisma.userRole.createMany({
      data: userRoles,
    });

    return await this.getUserById(userId);
  }
}

export default new UserService();
