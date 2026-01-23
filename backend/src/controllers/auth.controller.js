import authService from '../services/auth.service.js';
import { HTTP_STATUS } from '../constants/index.js';
import { successResponse } from '../utils/response.js';

class AuthController {
  /**
   * Register new user (redirect to OTP flow)
   */
  async register(req, res, next) {
    try {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Use OTP verification flow for registration',
        redirectTo: '/auth/otp/initiate'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register new tenant with admin user (redirect to OTP flow)
   */
  async registerTenant(req, res, next) {
    try {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Use OTP verification flow for registration',
        redirectTo: '/auth/otp/initiate'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   */
  async login(req, res, next) {
    try {
      const { email, password, rememberMe } = req.body;
      const tenantId = req.tenantId || req.body.tenantId;
      
      // Get IP address and user agent from request
      const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : null);
      const userAgent = req.get('User-Agent');
      
      const result = await authService.login({ 
        email, 
        password, 
        tenantId, 
        ipAddress, 
        userAgent 
      });
      
      // Set refresh token in HTTP-only cookie
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none', // allow cross-site cookie
      };

      // If rememberMe is true, set a maxAge for the cookie (e.g., 7 days)
      // If false, it will be a session cookie and expire when the browser is closed
      if (rememberMe) {
        cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      }

      res.cookie('refreshToken', result.refreshToken, cookieOptions);
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse({
          user: result.user,
          accessToken: result.accessToken,
        }, 'Login successful')
      );
    } catch (error) {
      // Handle login errors specifically - don't return 401 as it triggers refresh token flow
      // Return 200 with error details instead
      return res.status(HTTP_STATUS.OK).json({
        success: false,
        message: error.message || 'Invalid credentials',
        code: error.code || 'INVALID_CREDENTIALS'
      });
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      const { rememberMe } = req.body;
      
      const result = await authService.refreshToken(refreshToken);
      
      // Set new rotated refresh token in cookie
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      };

      // Maintain persistent status if rememberMe is true
      if (rememberMe) {
        cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      }
      
      res.cookie('refreshToken', result.refreshToken, cookieOptions);
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse({ accessToken: result.accessToken }, 'Token refreshed')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   */
  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      
      await authService.logout(refreshToken);
      
      // Clear the refresh token cookie (use same options as when setting it)
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
      });
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse(null, 'Logged out successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password
   */
  async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user.id;

      const result = await authService.changePassword(userId, oldPassword, newPassword);

      return res.status(HTTP_STATUS.OK).json(
        successResponse(null, result.message)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user
   */
  async me(req, res, next) {
    try {
      return res.status(HTTP_STATUS.OK).json(
        successResponse(req.user, 'User retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();