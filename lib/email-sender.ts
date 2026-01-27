/**
 * Utility functions và pseudocode cho việc gửi email
 * 
 * File này mô tả cách tích hợp SMTP thật vào hệ thống
 */

import { LoanDisbursementData } from "@/types/loan-disbursement";
import { renderEmailHTML, getEmailSubject } from "./email-template";

/**
 * Interface cho email service
 */
export interface EmailService {
  sendEmail(data: LoanDisbursementData): Promise<EmailSendResult>;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Pseudocode: Cách tích hợp với Nodemailer
 * 
 * 1. Cài đặt package:
 *    npm install nodemailer
 *    npm install --save-dev @types/nodemailer
 * 
 * 2. Tạo transporter:
 * 
 * import nodemailer from 'nodemailer';
 * 
 * const transporter = nodemailer.createTransport({
 *   host: process.env.SMTP_HOST, // VD: 'smtp.gmail.com'
 *   port: parseInt(process.env.SMTP_PORT || '587'),
 *   secure: false, // true cho port 465, false cho các port khác
 *   auth: {
 *     user: process.env.SMTP_USER,
 *     pass: process.env.SMTP_PASSWORD, // Hoặc app password cho Gmail
 *   },
 * });
 * 
 * 3. Gửi email:
 * 
 * async function sendEmail(data: LoanDisbursementData): Promise<EmailSendResult> {
 *   try {
 *     const emailHTML = renderEmailHTML(data);
 *     const subject = getEmailSubject(data.contract_code);
 * 
 *     const info = await transporter.sendMail({
 *       from: process.env.FROM_EMAIL || 'finance@y99.vn',
 *       to: data.customer_email,
 *       subject: subject,
 *       html: emailHTML,
 *       // Có thể thêm reply-to nếu cần
 *       replyTo: 'cskh@y99.vn',
 *     });
 * 
 *     return {
 *       success: true,
 *       messageId: info.messageId,
 *     };
 *   } catch (error) {
 *     return {
 *       success: false,
 *       error: error instanceof Error ? error.message : 'Unknown error',
 *     };
 *   }
 * }
 */

/**
 * Pseudocode: Cách tích hợp với SendGrid
 * 
 * 1. Cài đặt package:
 *    npm install @sendgrid/mail
 * 
 * 2. Setup:
 * 
 * import sgMail from '@sendgrid/mail';
 * sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
 * 
 * 3. Gửi email:
 * 
 * async function sendEmailWithSendGrid(data: LoanDisbursementData): Promise<EmailSendResult> {
 *   try {
 *     const emailHTML = renderEmailHTML(data);
 *     const subject = getEmailSubject(data.contract_code);
 * 
 *     const msg = {
 *       to: data.customer_email,
 *       from: process.env.FROM_EMAIL || 'finance@y99.vn',
 *       subject: subject,
 *       html: emailHTML,
 *     };
 * 
 *     const [response] = await sgMail.send(msg);
 * 
 *     return {
 *       success: true,
 *       messageId: response.headers['x-message-id'],
 *     };
 *   } catch (error) {
 *     return {
 *       success: false,
 *       error: error instanceof Error ? error.message : 'Unknown error',
 *     };
 *   }
 * }
 */

/**
 * Pseudocode: Cách tích hợp với AWS SES
 * 
 * 1. Cài đặt package:
 *    npm install @aws-sdk/client-ses
 * 
 * 2. Setup:
 * 
 * import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
 * 
 * const sesClient = new SESClient({
 *   region: process.env.AWS_REGION || 'us-east-1',
 *   credentials: {
 *     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
 *     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
 *   },
 * });
 * 
 * 3. Gửi email:
 * 
 * async function sendEmailWithSES(data: LoanDisbursementData): Promise<EmailSendResult> {
 *   try {
 *     const emailHTML = renderEmailHTML(data);
 *     const subject = getEmailSubject(data.contract_code);
 * 
 *     const command = new SendEmailCommand({
 *       Source: process.env.FROM_EMAIL || 'finance@y99.vn',
 *       Destination: {
 *         ToAddresses: [data.customer_email],
 *       },
 *       Message: {
 *         Subject: {
 *           Data: subject,
 *           Charset: 'UTF-8',
 *         },
 *         Body: {
 *           Html: {
 *             Data: emailHTML,
 *             Charset: 'UTF-8',
 *           },
 *         },
 *       },
 *     });
 * 
 *     const response = await sesClient.send(command);
 * 
 *     return {
 *       success: true,
 *       messageId: response.MessageId,
 *     };
 *   } catch (error) {
 *     return {
 *       success: false,
 *       error: error instanceof Error ? error.message : 'Unknown error',
 *     };
 *   }
 * }
 */

/**
 * Pseudocode: Cách tích hợp với Resend (modern email API)
 * 
 * 1. Cài đặt package:
 *    npm install resend
 * 
 * 2. Setup:
 * 
 * import { Resend } from 'resend';
 * const resend = new Resend(process.env.RESEND_API_KEY);
 * 
 * 3. Gửi email:
 * 
 * async function sendEmailWithResend(data: LoanDisbursementData): Promise<EmailSendResult> {
 *   try {
 *     const emailHTML = renderEmailHTML(data);
 *     const subject = getEmailSubject(data.contract_code);
 * 
 *     const { data: result, error } = await resend.emails.send({
 *       from: process.env.FROM_EMAIL || 'finance@y99.vn',
 *       to: data.customer_email,
 *       subject: subject,
 *       html: emailHTML,
 *     });
 * 
 *     if (error) {
 *       return {
 *         success: false,
 *         error: error.message,
 *       };
 *     }
 * 
 *     return {
 *       success: true,
 *       messageId: result?.id,
 *     };
 *   } catch (error) {
 *     return {
 *       success: false,
 *       error: error instanceof Error ? error.message : 'Unknown error',
 *     };
 *   }
 * }
 */

/**
 * Helper function để validate email trước khi gửi
 */
export function validateEmailData(data: LoanDisbursementData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.customer_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customer_email)) {
    errors.push("Email khách hàng không hợp lệ");
  }

  if (!data.disbursement_amount || data.disbursement_amount <= 0) {
    errors.push("Số tiền giải ngân phải lớn hơn 0");
  }

  if (!data.total_loan_amount || data.total_loan_amount <= 0) {
    errors.push("Tổng số vốn vay phải lớn hơn 0");
  }

  if (data.disbursement_amount > data.total_loan_amount) {
    errors.push("Số tiền giải ngân không được vượt quá tổng số vốn vay");
  }

  if (!data.due_day_each_month || data.due_day_each_month < 1 || data.due_day_each_month > 31) {
    errors.push("Ngày đến hạn phải từ 1 đến 31");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
