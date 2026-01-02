import prisma from '../config/db.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import otpGenerator from 'otp-generator';

class OtpService {
  /**
   * Generate a 6-digit numeric OTP
   * @returns {string} 6-digit OTP
   */
  generateOtp() {
    return otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
  }

  /**
   * Hash OTP for secure storage
   * @param {string} otp - Plain text OTP
   * @returns {Promise<string>} Hashed OTP
   */
  async hashOtp(otp) {
    const saltRounds = 10;
    return await bcrypt.hash(otp, saltRounds);
  }

  /**
   * Create OTP verification record
   * @param {Object} data - OTP data
   * @param {string} data.email - User email
   * @param {string} data.userType - 'tenant' or 'user'
   * @param {Object} data.payload - Registration data to store temporarily
   * @param {string} [data.tenantId] - Tenant ID (for user registration)
   * @returns {Promise<Object>} OTP verification record
   */
  async createOtpVerification({ email, userType, payload, tenantId }) {
    // Validate input based on user type
    if (userType === 'user' && !tenantId) {
      throw new Error('Tenant ID is required for user registration');
    }
    
    if (userType === 'tenant' && tenantId) {
      throw new Error('Tenant ID should not be provided for tenant registration');
    }

    // Generate OTP and verification token
    const otp = this.generateOtp();
    const hashedOtp = await this.hashOtp(otp);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Set expiration (5 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // Create OTP verification record
    const otpRecord = await prisma.otpVerification.create({
      data: {
        email,
        otp, // Store plain OTP temporarily for development (should be removed in production)
        hashedOtp,
        expiresAt,
        verificationToken,
        userType,
        payload,
        tenantId,
      },
    });

    return {
      otpRecord,
      otp, // Return plain OTP for email sending
    };
  }

  /**
   * Verify OTP
   * @param {string} email - User email
   * @param {string} otp - Plain text OTP
   * @param {string} verificationToken - Verification token
   * @returns {Promise<Object>} Verification result
   */
  async verifyOtp(email, otp, verificationToken) {
    // Find OTP record
    const otpRecord = await prisma.otpVerification.findUnique({
      where: { verificationToken },
    });

    // Check if record exists
    if (!otpRecord) {
      throw new Error('Invalid verification token');
    }

    // Check if OTP is already used
    if (otpRecord.isUsed) {
      throw new Error('OTP has already been used');
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < new Date()) {
      throw new Error('OTP has expired');
    }

    // Check if email matches
    if (otpRecord.email !== email) {
      throw new Error('Invalid email');
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, otpRecord.hashedOtp);
    if (!isValid) {
      throw new Error('Invalid OTP');
    }

    // Mark OTP as used
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    return {
      success: true,
      payload: otpRecord.payload,
      userType: otpRecord.userType,
      tenantId: otpRecord.tenantId,
    };
  }

  /**
   * Resend OTP
   * @param {string} verificationToken - Previous verification token
   * @returns {Promise<Object>} New OTP record
   */
  async resendOtp(verificationToken) {
    // Find existing OTP record
    const existingRecord = await prisma.otpVerification.findUnique({
      where: { verificationToken },
    });

    if (!existingRecord) {
      throw new Error('Invalid verification token');
    }

    // Check if existing OTP is still valid
    if (existingRecord.expiresAt > new Date() && !existingRecord.isUsed) {
      throw new Error('Previous OTP is still valid');
    }

    // Generate new OTP
    return await this.createOtpVerification({
      email: existingRecord.email,
      userType: existingRecord.userType,
      payload: existingRecord.payload,
      tenantId: existingRecord.tenantId,
    });
  }

  /**
   * Clean up expired OTP records
   * @returns {Promise<number>} Number of deleted records
   */
  async cleanupExpiredOtps() {
    const result = await prisma.otpVerification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }
}

export default new OtpService();