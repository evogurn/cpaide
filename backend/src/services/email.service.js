import nodemailer from 'nodemailer';
import { logger } from '../config/logger.js';

/**
 * Email service - nodemailer integration
 */
class EmailService {
  constructor() {
    // Create transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'your@email.com',
        pass: process.env.SMTP_PASSWORD || 'your_password',
      },
    });
  }

  /**
   * Send email
   */
  async sendEmail({ to, subject, html, text }) {
    logger.info('Sending email:', { to, subject });
    
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"CPAide" <no-reply@cpaide.com>',
        to,
        subject,
        html,
        text,
      });
      
      logger.info('Email sent successfully:', { messageId: info.messageId });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Failed to send email:', { error: error.message, to, subject });
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(user) {
    const subject = 'Welcome to CPAide';
    const html = `
      <h1>Welcome ${user.firstName}!</h1>
      <p>Thank you for joining CPAide Document Management System.</p>
    `;
    const text = `Welcome ${user.firstName}! Thank you for joining CPAide.`;
    
    return this.sendEmail({
      to: user.email,
      subject,
      html,
      text,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken) {
    const subject = 'Password Reset Request';
    const html = `
      <h1>Password Reset</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${process.env.CORS_ORIGIN}/reset-password?token=${resetToken}">Reset Password</a>
    `;
    const text = `Password reset link: ${process.env.CORS_ORIGIN}/reset-password?token=${resetToken}`;
    
    return this.sendEmail({
      to: user.email,
      subject,
      html,
      text,
    });
  }

  /**
   * Send OTP verification email
   */
  async sendOtpEmail({ email, otp, userType }) {
    const subject = 'Email Verification - CPAide';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Email Verification</h2>
        <p>Hello,</p>
        <p>Thank you for registering with CPAide. Please use the following OTP code to verify your email address:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="font-size: 32px; letter-spacing: 8px; color: #1f2937;">${otp}</h1>
        </div>
        <p>This code will expire in 5 minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #6b7280;">
          This email was sent to ${email} because someone attempted to register for a ${userType === 'tenant' ? 'tenant organization' : 'user account'} at CPAide.
        </p>
      </div>
    `;
    
    const text = `
Email Verification - CPAide

Hello,

Thank you for registering with CPAide. Please use the following OTP code to verify your email address:

${otp}

This code will expire in 5 minutes.

If you didn't request this verification, please ignore this email.
    `;
    
    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  }
}

export default new EmailService();