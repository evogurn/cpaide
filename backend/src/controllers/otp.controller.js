import otpService from '../services/otp.service.js';
import emailService from '../services/email.service.js';
import authService from '../services/auth.service.js';
import notificationService from '../services/notification.service.js';
import { HTTP_STATUS } from '../constants/index.js';
import { successResponse, errorResponse } from '../utils/response.js';

// Mask email for display (e.g., jo***@acme.com)
const maskEmail = (email) => {
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `${'*'.repeat(localPart.length)}@${domain}`;
  }
  return `${localPart[0]}${'*'.repeat(localPart.length - 2)}${localPart[localPart.length - 1]}@${domain}`;
};

class OtpController {
  /**
   * Initiate OTP verification
   */
  async initiateOtp(req, res, next) {
    try {
      const { userType, email, payload, tenantId } = req.body;
      
      // Create OTP verification record
      const { otpRecord, otp } = await otpService.createOtpVerification({
        email,
        userType,
        payload,
        tenantId,
      });
      
      // Send OTP email
      const emailResult = await emailService.sendOtpEmail({
        email,
        otp,
        userType,
        firstName: payload.firstName || payload.adminFirstName || ''
      });
      
      if (!emailResult.success) {
        // Log the error but don't fail the request
        console.error('Failed to send OTP email:', emailResult.error);
      }
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse({
          verificationToken: otpRecord.verificationToken,
          emailMask: maskEmail(email),
        }, 'OTP sent successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify OTP
   */
  async verifyOtp(req, res, next) {
    try {
      const { email, otp, verificationToken } = req.body;
      
      // Verify OTP
      const verificationResult = await otpService.verifyOtp(email, otp, verificationToken);
      
      // Create user/tenant based on userType
      let result;
      if (verificationResult.userType === 'tenant') {
        // Create tenant and admin user
        result = await authService.registerTenant(verificationResult.payload);
        
        // Send notification to master admin about new tenant registration
        try {
          // Create notification for master admin
          await notificationService.sendTenantRegistrationNotification(result.tenant);
          
          // Send email notification to master admin
          const masterAdminEmail = process.env.MASTER_ADMIN_EMAIL || 'admin@cpaide.com';
          await emailService.sendNewTenantNotification(result.tenant, masterAdminEmail);
        } catch (notificationError) {
          console.error('Failed to send tenant registration notification:', notificationError);
          // Don't fail the registration process if notification fails
        }
      } else {
        // Create regular user
        result = await authService.register(verificationResult.payload);
      }
      
      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      
      return res.status(HTTP_STATUS.CREATED).json(
        successResponse(
          {
            ...(verificationResult.userType === 'tenant' 
              ? { 
                  tenant: result.tenant,
                  user: result.user,
                  accessToken: result.accessToken,
                }
              : {
                  user: result.user,
                  accessToken: result.accessToken,
                }
            ),
          },
          verificationResult.userType === 'tenant' 
            ? 'Tenant and admin user registered successfully' 
            : 'User registered successfully',
          HTTP_STATUS.CREATED
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resend OTP
   */
  async resendOtp(req, res, next) {
    try {
      const { verificationToken } = req.body;
      
      // Resend OTP
      const { otpRecord, otp } = await otpService.resendOtp(verificationToken);
      
      // Send OTP email
      const emailResult = await emailService.sendOtpEmail({
        email: otpRecord.email,
        otp,
        userType: otpRecord.userType,
        firstName: otpRecord.payload?.firstName || otpRecord.payload?.adminFirstName || ''
      });
      
      if (!emailResult.success) {
        // Log the error but don't fail the request
        console.error('Failed to send OTP email:', emailResult.error);
      }
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse({
          verificationToken: otpRecord.verificationToken,
          emailMask: maskEmail(otpRecord.email),
        }, 'OTP resent successfully')
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new OtpController();