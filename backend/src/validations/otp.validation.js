import { z } from 'zod';

// Initiate OTP schema
export const initiateOtpSchema = z.object({
  userType: z.enum(['tenant', 'user']),
  email: z.string().email('Invalid email address'),
  payload: z.object({}).passthrough(), // Allow any payload structure
  tenantId: z.string().optional(), // Required for user registration only
}).refine(
  (data) => {
    // If user type is 'user', tenantId is required
    if (data.userType === 'user') {
      return !!data.tenantId;
    }
    // For tenant registration, tenantId should not be provided
    if (data.userType === 'tenant') {
      return !data.tenantId;
    }
    return true;
  },
  {
    message: "Tenant ID should not be provided for tenant registration, but is required for user registration",
    path: ["tenantId"],
  }
);

// Verify OTP schema
export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  verificationToken: z.string().min(1, 'Verification token is required'),
});

// Resend OTP schema
export const resendOtpSchema = z.object({
  verificationToken: z.string().min(1, 'Verification token is required'),
});