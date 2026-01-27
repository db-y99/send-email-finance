/**
 * Schema dữ liệu cho thông báo giải ngân khoản vay
 */

export interface LoanDisbursementData {
  // Thông tin khách hàng
  customer_name: string;
  customer_email: string; // TO email (required)
  cc_emails?: string; // CC emails (optional, comma-separated)

  // Thông tin hợp đồng
  contract_code: string;

  // Thông tin giải ngân
  disbursement_amount: number;
  disbursement_date: string; // Format: YYYY-MM-DD

  // Thông tin khoản vay
  total_loan_amount: number;
  loan_term_months: number;
  loan_start_date: string; // Format: YYYY-MM-DD
  loan_end_date: string; // Format: YYYY-MM-DD
  due_day_each_month: number; // Ngày đến hạn hàng tháng (1-31)

  // Thông tin ngân hàng
  bank_name: string;
  bank_account_number: string;
  beneficiary_name: string;

  // File đính kèm (optional)
  attachments?: File[];
}

/**
 * Interface cho file attachment trong email
 */
export interface EmailAttachment {
  filename: string;
  content: Buffer | string; // Buffer cho binary, string cho base64
  contentType?: string;
}

/**
 * Dữ liệu mẫu để test
 */
export const sampleLoanDisbursementData: LoanDisbursementData = {
  customer_name: "Nguyễn Thành Phong",
  customer_email: "np95085@gmail.com",
  contract_code: "AP261025021",
  disbursement_amount: 2700000,
  disbursement_date: "2025-10-26",
  total_loan_amount: 3000000,
  loan_term_months: 6,
  loan_start_date: "2025-10-26",
  loan_end_date: "2026-04-26",
  due_day_each_month: 26,
  bank_name: "Ngân hàng Ngoại thương Việt Nam (Vietcombank)",
  bank_account_number: "1058649754",
  beneficiary_name: "NGUYEN THANH PHONG",
};
