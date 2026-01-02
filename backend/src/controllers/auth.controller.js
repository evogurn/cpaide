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
      const { email, password } = req.body;
      const tenantId = req.tenantId || req.body.tenantId;
      
      const result = await authService.login({ email, password, tenantId });
      
      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse({
          user: result.user,
          accessToken: result.accessToken,
        }, 'Login successful')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      
      const result = await authService.refreshToken(refreshToken);
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse(result, 'Token refreshed')
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
      
      res.clearCookie('refreshToken');
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse(null, 'Logged out successfully')
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