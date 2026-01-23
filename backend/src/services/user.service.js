import prisma from '../config/db.js';
import { hashPassword } from '../utils/bcrypt.js';
import { HTTP_STATUS, ERROR_CODES } from '../constants/index.js';
import emailService from './email.service.js';
import crypto from 'crypto';

class UserService {
  /**
   * Create a new user
   */
  async createUser({ tenantId, email, password, firstName, lastName, roleIds = [], sendInvite = true }) {
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

    // Generate random password if not provided or if sending invite
    let passwordToUse = password;
    if (!passwordToUse) {
      passwordToUse = crypto.randomBytes(8).toString('hex');
    }

    // Hash password
    const hashedPassword = await hashPassword(passwordToUse);

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
      include: {
        tenant: true
      }
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

    // Send invite email if requested
    if (sendInvite) {
      try {
        await emailService.sendUserInviteEmail(user, user.tenant, passwordToUse);
      } catch (error) {
        // Log error but don't fail user creation
        console.error('Failed to send invite email:', error);
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
      }),
      prisma.user.count({ where }),
    ]);

    // Remove passwords from response
    const sanitizedUsers = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return { users: sanitizedUsers, total };
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

  /**
   * Reset user password
   */
  async resetPassword(userId, newPassword) {
    console.log('Resetting password for user:', userId);
    const hashedPassword = await hashPassword(newPassword);
    console.log('Hashed password:', hashedPassword.substring(0, 20) + '...');
    
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
    
    // Verify the password was updated
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    });
    
    console.log('Password updated in DB:', updatedUser.password === hashedPassword);

    return true;
  }

  /**
   * List all available roles
   */
  async listRoles() {
    return await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });
  }

  /**
   * List all available permissions
   */
  async listPermissions() {
    return await prisma.permission.findMany();
  }
}

export default new UserService();
