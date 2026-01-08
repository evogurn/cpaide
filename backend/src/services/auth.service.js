import prisma from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import { createAccessToken, createRefreshToken } from '../utils/token.js';
import { HTTP_STATUS, ERROR_CODES } from '../constants/index.js';
import crypto from 'crypto';
import tenantService from './tenant.service.js';

class AuthService {
  /**
   * Register a new user
   */
  async register({ email, password, firstName, lastName, tenantId }) {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        tenantId,
        deletedAt: null,
      },
    });

    if (existingUser) {
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
        email,
        password: hashedPassword,
        firstName,
        lastName,
        tenantId,
        status: 'ACTIVE',
      },
      include: {
        tenant: true,
      },
    });

    // Assign default USER role
    const userRole = await prisma.role.findUnique({
      where: { name: 'USER' },
    });

    if (userRole) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: userRole.id,
        },
      });
    }

    // Generate tokens
    const accessToken = createAccessToken({ userId: user.id, tenantId: user.tenantId });
    const refreshToken = createRefreshToken({ userId: user.id, tenantId: user.tenantId });

    // Store refresh token
    await this.storeRefreshToken(user.id, refreshToken);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Register a new tenant with admin user
   */
  async registerTenant({ tenantName, adminFirstName, adminLastName, adminEmail, adminPassword }) {
    try {
      // Generate subdomain from tenant name
      const subdomain = tenantName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 63);

      // Create tenant with PENDING approval status
      const tenant = await tenantService.createTenant({
        name: tenantName,
        subdomain,
        approvalStatus: 'PENDING', // New tenants require admin approval
      });

      // Hash admin password
      const hashedPassword = await hashPassword(adminPassword);

      // Create admin user
      const adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          firstName: adminFirstName,
          lastName: adminLastName,
          tenantId: tenant.id,
          status: 'ACTIVE',
        },
        include: {
          tenant: true,
        },
      });

      // Assign TENANT_ADMIN role to admin user
      const tenantAdminRole = await prisma.role.findUnique({
        where: { name: 'TENANT_ADMIN' },
      });

      if (tenantAdminRole) {
        await prisma.userRole.create({
          data: {
            userId: adminUser.id,
            roleId: tenantAdminRole.id,
          },
        });
      }

      // Generate tokens
      const accessToken = createAccessToken({ userId: adminUser.id, tenantId: tenant.id });
      const refreshToken = createRefreshToken({ userId: adminUser.id, tenantId: tenant.id });

      // Store refresh token
      await this.storeRefreshToken(adminUser.id, refreshToken);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = adminUser;

      return {
        tenant,
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      // If tenant was created but user creation failed, we might want to clean up
      // But for simplicity, we'll just rethrow the error
      throw error;
    }
  }

  /**
   * Login user
   */
  async login({ email, password, tenantId, ipAddress, userAgent }) {
    // Find user
    // In a multi-tenant system, we need to find the user within the specified tenant
    // If no tenantId is provided, we might need to look up which tenant the user belongs to
    let user;
    
    if (tenantId) {
      // If tenantId is provided, search within that tenant
      user = await prisma.user.findFirst({
        where: {
          email,
          tenantId,
          deletedAt: null,
        },
        include: {
          tenant: {
            include: {
              subscriptionPlan: true,
            },
          },
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });
    } else {
      // If no tenantId provided, find user by email across all tenants
      user = await prisma.user.findFirst({
        where: {
          email,
          deletedAt: null,
        },
        include: {
          tenant: {
            include: {
              subscriptionPlan: true,
            },
          },
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });
    }

    let loginStatus = 'SUCCESS';
    let failureReason = null;

    if (!user) {
      loginStatus = 'FAILED';
      failureReason = 'Invalid credentials';
      
      // Record failed login attempt
      try {
        await prisma.loginHistory.create({
          data: {
            userId: null, // We don't know the userId
            tenantId: tenantId || null, // Use null if tenantId is undefined
            ipAddress,
            userAgent,
            loginStatus,
            failureReason,
          },
        });
      } catch (historyError) {
        // If login history creation fails, log it but don't prevent the login failure
        console.error('Failed to create login history record:', historyError);
      }
      
      const error = new Error('Invalid credentials');
      error.statusCode = HTTP_STATUS.UNAUTHORIZED;
      error.code = ERROR_CODES.INVALID_CREDENTIALS;
      throw error;
    }
    
    // If tenantId was provided but user doesn't belong to that tenant
    if (tenantId && user.tenantId !== tenantId) {
      loginStatus = 'FAILED';
      failureReason = 'Invalid credentials';
      
      // Record failed login attempt
      try {
        await prisma.loginHistory.create({
          data: {
            userId: user.id,
            tenantId: tenantId || null, // Use the provided tenantId
            ipAddress,
            userAgent,
            loginStatus,
            failureReason,
          },
        });
      } catch (historyError) {
        // If login history creation fails, log it but don't prevent the login failure
        console.error('Failed to create login history record:', historyError);
      }
      
      const error = new Error('Invalid credentials');
      error.statusCode = HTTP_STATUS.UNAUTHORIZED;
      error.code = ERROR_CODES.INVALID_CREDENTIALS;
      throw error;
    }

    // Check tenant approval status
    if (user.tenant.approvalStatus !== 'APPROVED') {
      loginStatus = 'FAILED';
      failureReason = 'Tenant account is pending admin approval';
      
      // Record failed login attempt
      try {
        await prisma.loginHistory.create({
          data: {
            userId: user.id,
            tenantId: user.tenantId,
            ipAddress,
            userAgent,
            loginStatus,
            failureReason,
          },
        });
      } catch (historyError) {
        // If login history creation fails, log it but don't prevent the login failure
        console.error('Failed to create login history record:', historyError);
      }
      
      const error = new Error('Your account is pending admin approval. You will be notified once approved.');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      error.code = ERROR_CODES.FORBIDDEN;
      throw error;
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      loginStatus = 'FAILED';
      failureReason = 'Account is not active';
      
      // Record failed login attempt
      try {
        await prisma.loginHistory.create({
          data: {
            userId: user.id,
            tenantId: user.tenantId,
            ipAddress,
            userAgent,
            loginStatus,
            failureReason,
          },
        });
      } catch (historyError) {
        // If login history creation fails, log it but don't prevent the login failure
        console.error('Failed to create login history record:', historyError);
      }
      
      const error = new Error('Account is not active');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      error.code = ERROR_CODES.FORBIDDEN;
      throw error;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      loginStatus = 'FAILED';
      failureReason = 'Invalid credentials';
      
      // Record failed login attempt
      try {
        await prisma.loginHistory.create({
          data: {
            userId: user.id,
            tenantId: user.tenantId,
            ipAddress,
            userAgent,
            loginStatus,
            failureReason,
          },
        });
      } catch (historyError) {
        // If login history creation fails, log it but don't prevent the login failure
        console.error('Failed to create login history record:', historyError);
      }
      
      const error = new Error('Invalid credentials');
      error.statusCode = HTTP_STATUS.UNAUTHORIZED;
      error.code = ERROR_CODES.INVALID_CREDENTIALS;
      throw error;
    }

    // Update last login
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    } catch (updateError) {
      // If updating last login fails, log it but continue with login
      console.error('Failed to update last login time:', updateError);
    }

    // Record successful login
    try {
      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          tenantId: user.tenantId,
          ipAddress,
          userAgent,
          loginStatus: 'SUCCESS',
        },
      });
    } catch (historyError) {
      // If login history creation fails, log it but continue with login
      console.error('Failed to create login history record:', historyError);
    }

    // Generate tokens
    const accessToken = createAccessToken({ userId: user.id, tenantId: user.tenantId });
    const refreshToken = createRefreshToken({ userId: user.id, tenantId: user.tenantId });

    // Store refresh token
    await this.storeRefreshToken(user.id, refreshToken);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    // Verify refresh token in database
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.isRevoked || tokenRecord.expiresAt < new Date()) {
      const error = new Error('Invalid or expired refresh token');
      error.statusCode = HTTP_STATUS.UNAUTHORIZED;
      error.code = ERROR_CODES.TOKEN_INVALID;
      throw error;
    }

    // Generate new access token
    const accessToken = createAccessToken({
      userId: tokenRecord.userId,
      tenantId: tokenRecord.user.tenantId,
    });

    return { accessToken };
  }

  /**
   * Logout user
   */
  async logout(refreshToken) {
    // Revoke refresh token
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { isRevoked: true },
    });

    return { message: 'Logged out successfully' };
  }

  /**
   * Store refresh token
   */
  async storeRefreshToken(userId, token) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }
}

export default new AuthService();