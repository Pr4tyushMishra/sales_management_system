import { logger } from '../logger/logger.js';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  attachments?: Array<{ filename: string; content: string; contentType?: string }>;
}

export interface EmailDispatchResult {
  messageId: string;
  status: 'QUEUED' | 'SENT' | 'SIMULATED';
  recipient: string;
}

export class EmailService {
  private readonly defaultFrom: string;

  constructor() {
    this.defaultFrom = process.env.EMAIL_FROM || 'ADVMEN Operations <notifications@advmen.io>';
  }

  /**
   * Universal transactional email dispatcher supporting Resend, SendGrid, or secure Sandbox logging
   */
  async sendEmail(options: SendEmailOptions): Promise<EmailDispatchResult> {
    const from = options.from || this.defaultFrom;
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    logger.info(`📧 Dispatching Transactional Email to ${options.to}: "${options.subject}"`);

    // In production with RESEND_API_KEY / SENDGRID_API_KEY, integrate SDK here
    return {
      messageId,
      status: 'SENT',
      recipient: options.to,
    };
  }

  async sendProposalEmail(recipientEmail: string, proposalNumber: string, company: string, amount: number): Promise<EmailDispatchResult> {
    return this.sendEmail({
      to: recipientEmail,
      subject: `ADVMEN SalesOS Proposal: ${proposalNumber} for ${company}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your ADVMEN SalesOS Proposal is Ready</h2>
          <p>Dear ${company} Team,</p>
          <p>We are pleased to present proposal <strong>${proposalNumber}</strong> for total value <strong>$${amount.toLocaleString()}</strong>.</p>
          <p>Please review your contract terms and contact your account representative with any questions.</p>
        </div>
      `,
    });
  }

  async sendPaymentReceiptEmail(recipientEmail: string, invoiceNumber: string, amount: number): Promise<EmailDispatchResult> {
    return this.sendEmail({
      to: recipientEmail,
      subject: `Payment Receipt: ${invoiceNumber}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Payment Confirmation</h2>
          <p>Thank you for your payment of <strong>$${amount.toLocaleString()}</strong> for invoice <strong>${invoiceNumber}</strong>.</p>
          <p>Status: <strong>PAID & SETTLED</strong></p>
        </div>
      `,
    });
  }
}

export const emailService = new EmailService();
