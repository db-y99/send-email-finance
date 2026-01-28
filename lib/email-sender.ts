/**
 * Email sender service using Resend API (via fetch)
 */

import { TLoanDisbursementData } from "@/types/loan-disbursement";
import { renderEmailHTML, getEmailSubject } from "./email-template";
import { Result, ok, err } from "@/types/result.types";
import { createError } from "./errors";
import { env } from "@/config/env";
import { parseCCEmails } from "./email";

/**
 * Result type for email sending
 */
export type EmailSendResponse = {
  id: string;
};

/**
 * Gửi email thông báo giải ngân sử dụng Resend API (via fetch)
 * @param data - Dữ liệu giải ngân đã được validate
 * @returns Result với ID của email đã gửi hoặc AppErrorObject
 */
export async function sendLoanDisbursementEmail(
  data: TLoanDisbursementData
): Promise<Result<EmailSendResponse>> {
  try {
    const emailHTML = renderEmailHTML(data);
    const subject = getEmailSubject(data.contract_code);
    const ccEmails = parseCCEmails(data.cc_emails);

    // Resend API payload
    const payload = {
      from: env.FROM_EMAIL,
      to: data.customer_email,
      cc: ccEmails.length > 0 ? ccEmails : undefined,
      subject: subject,
      html: emailHTML,
    };

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", result);
      return err(
        createError.email(
          `Resend API error: ${result.message || response.statusText}`,
          result
        )
      );
    }

    return ok({ id: result.id });
  } catch (error) {
    console.error("Critical error in sendLoanDisbursementEmail:", error);
    return err(
      createError.email(
        error instanceof Error ? error.message : "Failed to send email"
      )
    );
  }
}

/**
 * Helper function để validate email trước khi gửi (Legacy - maintained for compatibility if needed)
 * @deprecated Use Zod schema instead
 */
export function validateEmailData(data: TLoanDisbursementData): {
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
