import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Email service - nodemailer integration with template system
 */
class EmailService {
  constructor() {
    // Create transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  /**
   * Load email template from file
   */
  loadTemplate(templateName) {
    const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
    try {
      return fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      logger.warn(`Template ${templateName} not found, using default template`);
      return null;
    }
  }

  /**
   * Replace template variables
   */
  replaceTemplateVariables(template, variables) {
    let processedTemplate = template;
    for (const [key, value] of Object.entries(variables)) {
      processedTemplate = processedTemplate.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return processedTemplate;
  }

  /**
   * Send email
   */
  async sendEmail({ to, subject, html, text, templateName, templateVariables = {} }) {
    let finalHtml = html;
    let finalText = text;

    // If template name is provided, load and process the template
    if (templateName) {
      const template = this.loadTemplate(templateName);
      console.log(`Template ${templateName} loaded: ${!!template}`);
      if (template) {
        finalHtml = this.replaceTemplateVariables(template, templateVariables);
      } else {
        console.error(`Template ${templateName} not found`);
      }
    }

    console.log('Sending email:', { to, subject });
    
    // Validate SMTP configuration
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.SMTP_FROM) {
      console.error('Missing SMTP configuration');
      return { success: false, error: 'Missing SMTP configuration' };
    }
    
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        html: finalHtml,
        text: finalText || finalHtml.replace(/<[^>]*>/g, ''), // Generate text version from HTML if not provided
      });
      
      logger.info('Email sent successfully:', { messageId: info.messageId });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Failed to send email:', { error: error.message, to, subject });
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome email to tenant
   */
  async sendWelcomeEmail(user, tenant) {
    const subject = 'Welcome to CPAide - Your Account is Ready!';
    const templateVariables = {
      firstName: user.firstName,
      tenantName: tenant.name,
      loginUrl: `${process.env.CORS_ORIGIN}/login`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@cpaide.com'
    };

    return this.sendEmail({
      to: user.email,
      subject,
      templateName: 'welcome',
      templateVariables,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken) {
    const subject = 'Password Reset Request';
    const templateVariables = {
      firstName: user.firstName,
      resetUrl: `${process.env.CORS_ORIGIN}/reset-password?token=${resetToken}`,
      expiryTime: '5 minutes',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@cpaide.com'
    };

    return this.sendEmail({
      to: user.email,
      subject,
      templateName: 'password-reset',
      templateVariables,
    });
  }

  /**
   * Send OTP verification email
   */
  async sendOtpEmail({ email, otp, userType, firstName = '' }) {
    const subject = 'Email Verification - CPAide';
    const templateVariables = {
      firstName: firstName,
      otp: otp,
      expiryTime: '5 minutes',
      userType: userType === 'tenant' ? 'tenant organization' : 'user account',
      email: email,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@cpaide.com'
    };

    return this.sendEmail({
      to: email,
      subject,
      templateName: 'otp-verification',
      templateVariables,
    });
  }

  /**
   * Send notification to master admin about new tenant registration
   */
  async sendNewTenantNotification(tenant, adminEmail) {
    const subject = 'New Tenant Registration - Approval Required';
    const templateVariables = {
      tenantName: tenant.name,
      adminName: 'Master Admin',
      tenantEmail: tenant.adminEmail || 'N/A',
      registrationDate: new Date().toLocaleDateString(),
      adminPanelUrl: `${process.env.CORS_ORIGIN}/cpaide/admin`,
      tenantId: tenant.id
    };

    return this.sendEmail({
      to: adminEmail,
      subject,
      templateName: 'new-tenant-notification',
      templateVariables,
    });
  }

  /**
   * Send tenant approval notification
   */
  async sendTenantApprovalNotification(tenant, adminUser) {
    const subject = 'Your CPAide Account Has Been Approved!';
    const templateVariables = {
      firstName: tenant.adminFirstName || 'User',
      tenantName: tenant.name,
      loginUrl: `${process.env.CORS_ORIGIN}/login`,
      adminName: `${adminUser.firstName} ${adminUser.lastName}`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@cpaide.com'
    };

    return this.sendEmail({
      to: tenant.adminEmail,
      subject,
      templateName: 'tenant-approved',
      templateVariables,
    });
  }

  /**
   * Send tenant rejection notification
   */
  async sendTenantRejectionNotification(tenant, adminUser, reason = 'Administrative review') {
    const subject = 'CPAide Account Registration Status - Action Required';
    const templateVariables = {
      firstName: tenant.adminFirstName || 'User',
      tenantName: tenant.name,
      rejectionReason: reason,
      adminName: `${adminUser.firstName} ${adminUser.lastName}`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@cpaide.com'
    };

    return this.sendEmail({
      to: tenant.adminEmail,
      subject,
      templateName: 'tenant-rejected',
      templateVariables,
    });
  }

  /**
   * Send support ticket notification
   */
  async sendSupportTicketNotification(ticket, recipientEmail, type = 'new') {
    const subject = type === 'new' 
      ? 'New Support Ticket Created' 
      : 'Support Ticket Updated';
    
    const templateVariables = {
      ticketId: ticket.id,
      ticketTitle: ticket.title,
      ticketDescription: ticket.description,
      ticketStatus: ticket.status,
      ticketPriority: ticket.priority,
      ticketUrl: `${process.env.CORS_ORIGIN}/support/ticket/${ticket.id}`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@cpaide.com'
    };

    return this.sendEmail({
      to: recipientEmail,
      subject,
      templateName: type === 'new' ? 'support-ticket-created' : 'support-ticket-updated',
      templateVariables,
    });
  }

  /**
   * Send support ticket resolution notification
   */
  async sendSupportTicketResolutionNotification(ticket, recipientEmail) {
    const subject = 'Support Ticket Resolved';
    const templateVariables = {
      ticketId: ticket.id,
      ticketTitle: ticket.title,
      resolutionNotes: ticket.resolutionNotes || 'N/A',
      ticketUrl: `${process.env.CORS_ORIGIN}/support/ticket/${ticket.id}`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@cpaide.com'
    };

    return this.sendEmail({
      to: recipientEmail,
      subject,
      templateName: 'support-ticket-resolved',
      templateVariables,
    });
  }

  /**
   * Send billing notification
   */
  async sendBillingNotification(tenant, user, type, amount, planName) {
    let subject = '';
    let templateName = '';

    switch(type) {
      case 'payment_success':
        subject = 'Payment Received Successfully';
        templateName = 'billing-payment-success';
        break;
      case 'payment_failed':
        subject = 'Payment Failed - Action Required';
        templateName = 'billing-payment-failed';
        break;
      case 'subscription_updated':
        subject = 'Subscription Plan Updated';
        templateName = 'billing-payment-success'; // Using the same template for now
        break;
      default:
        subject = 'Billing Notification';
        templateName = 'billing-payment-success';
    }

    const templateVariables = {
      firstName: user.firstName,
      tenantName: tenant.name,
      amount: amount,
      planName: planName,
      billingUrl: `${process.env.CORS_ORIGIN}/billing`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@cpaide.com'
    };

    return this.sendEmail({
      to: user.email,
      subject,
      templateName,
      templateVariables,
    });
  }

  /**
   * Send user invite email with randomly generated password
   */
  async sendUserInviteEmail(user, tenant, password) {
    const subject = `You've been invited to join ${tenant.name} on CPAide`;
    const templateVariables = {
      firstName: user.firstName,
      tenantName: tenant.name,
      email: user.email,
      password: password,
      loginUrl: `${process.env.CORS_ORIGIN}/login`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@cpaide.com'
    };

    return this.sendEmail({
      to: user.email,
      subject,
      templateName: 'user-invite',
      templateVariables,
    });
  }

  /**
   * Send tenant organization name change notification to master admin
   */
  async sendTenantOrgNameChangeNotification(tenant, oldName, adminUser) {
    const adminEmail = process.env.MASTER_ADMIN_EMAIL || 'admin@cpaide.com';
    const subject = 'Tenant Organization Name Changed';
    
    const templateVariables = {
      oldName,
      newName: tenant.name,
      tenantId: tenant.id,
      changedBy: `${adminUser.firstName} ${adminUser.lastName}`,
      changedAt: new Date().toLocaleString()
    };

    return this.sendEmail({
      to: adminEmail,
      subject,
      templateName: 'tenant-org-name-changed',
      templateVariables,
    });
  }

  /**
   * Send tenant UI update notification to master admin
   */
  async sendTenantUIUpdateNotification(tenant, updateType, adminUser) {
    const adminEmail = process.env.MASTER_ADMIN_EMAIL || 'admin@cpaide.com';
    const subject = `Tenant ${updateType} Updated`;
    
    const templateVariables = {
      tenantName: tenant.name,
      updateType,
      tenantId: tenant.id,
      updatedBy: `${adminUser.firstName} ${adminUser.lastName}`,
      updatedAt: new Date().toLocaleString()
    };

    return this.sendEmail({
      to: adminEmail,
      subject,
      templateName: 'tenant-ui-updated',
      templateVariables,
    });
  }

  /**
   * Send tenant billing plan update notification to master admin
   */
  async sendTenantBillingPlanUpdateNotification(tenant, oldPlan, newPlan, adminUser) {
    const adminEmail = process.env.MASTER_ADMIN_EMAIL || 'admin@cpaide.com';
    const subject = 'Tenant Billing Plan Updated';
    
    const templateVariables = {
      tenantName: tenant.name,
      oldPlan: oldPlan?.name || 'None',
      newPlan: newPlan.name,
      tenantId: tenant.id,
      updatedBy: `${adminUser.firstName} ${adminUser.lastName}`,
      updatedAt: new Date().toLocaleString()
    };

    return this.sendEmail({
      to: adminEmail,
      subject,
      templateName: 'tenant-billing-plan-updated',
      templateVariables,
    });
  }

  /**
   * Send tenant billing expired notification to master admin
   */
  async sendTenantBillingExpiredNotification(tenant) {
    const adminEmail = process.env.MASTER_ADMIN_EMAIL || 'admin@cpaide.com';
    const subject = '⚠️ URGENT: Tenant Billing Expired';
    
    const templateVariables = {
      tenantName: tenant.name,
      tenantId: tenant.id,
      expiredAt: new Date().toLocaleString()
    };

    return this.sendEmail({
      to: adminEmail,
      subject,
      templateName: 'tenant-billing-expired',
      templateVariables,
    });
  }

  /**
   * Send staff folder creation notification to tenant admin
   */
  async sendStaffFolderCreatedNotification(folder, user, tenantAdmin) {
    const subject = 'New Folder Created in Your Organization';
    
    const templateVariables = {
      firstName: tenantAdmin.firstName,
      folderName: folder.name,
      folderId: folder.id,
      createdBy: `${user.firstName} ${user.lastName}`,
      creatorId: user.id,
      createdAt: new Date().toLocaleString()
    };

    return this.sendEmail({
      to: tenantAdmin.email,
      subject,
      templateName: 'staff-folder-created',
      templateVariables,
    });
  }

  /**
   * Send staff document upload notification to tenant admin
   */
  async sendStaffDocumentUploadedNotification(document, user, tenantAdmin) {
    const subject = 'New Document Uploaded to Your Organization';
    
    const templateVariables = {
      firstName: tenantAdmin.firstName,
      documentName: document.name,
      documentId: document.id,
      fileSize: document.size,
      uploadedBy: `${user.firstName} ${user.lastName}`,
      uploaderId: user.id,
      uploadedAt: new Date().toLocaleString()
    };

    return this.sendEmail({
      to: tenantAdmin.email,
      subject,
      templateName: 'staff-document-uploaded',
      templateVariables,
    });
  }

  /**
   * Send staff folder deletion notification to tenant admin
   */
  async sendStaffFolderDeletedNotification(folderName, user, tenantAdmin) {
    const subject = '⚠️ Folder Deleted from Your Organization';
    
    const templateVariables = {
      firstName: tenantAdmin.firstName,
      folderName,
      deletedBy: `${user.firstName} ${user.lastName}`,
      deleterId: user.id,
      deletedAt: new Date().toLocaleString()
    };

    return this.sendEmail({
      to: tenantAdmin.email,
      subject,
      templateName: 'staff-folder-deleted',
      templateVariables,
    });
  }

  /**
   * Send staff document deletion notification to tenant admin
   */
  async sendStaffDocumentDeletedNotification(documentName, user, tenantAdmin) {
    const subject = '⚠️ Document Deleted from Your Organization';
    
    const templateVariables = {
      firstName: tenantAdmin.firstName,
      documentName,
      deletedBy: `${user.firstName} ${user.lastName}`,
      deleterId: user.id,
      deletedAt: new Date().toLocaleString()
    };

    return this.sendEmail({
      to: tenantAdmin.email,
      subject,
      templateName: 'staff-document-deleted',
      templateVariables,
    });
  }
}

export default new EmailService();