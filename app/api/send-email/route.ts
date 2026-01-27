import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { LoanDisbursementData } from "@/types/loan-disbursement";
import { renderEmailHTML, getEmailSubject } from "@/lib/email-template";

// Hoist RegExp to module scope (rule 7.9)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Parse và validate CC emails từ string (comma-separated)
 */
function parseCCEmails(ccEmails?: string): string[] {
  if (!ccEmails?.trim()) return [];
  return ccEmails
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email && EMAIL_REGEX.test(email));
}

/**
 * API Route để gửi email thông báo giải ngân
 * 
 * Pseudocode logic gửi email:
 * 
 * 1. Nhận dữ liệu từ request body
 * 2. Validate dữ liệu đầu vào
 * 3. Render email HTML từ template và dữ liệu
 * 4. Tạo subject line
 * 5. Gửi email qua SMTP (cần tích hợp thư viện như nodemailer, sendgrid, etc.)
 * 
 * Ví dụ với nodemailer:
 * 
 * import nodemailer from 'nodemailer';
 * 
 * const transporter = nodemailer.createTransport({
 *   host: process.env.SMTP_HOST,
 *   port: parseInt(process.env.SMTP_PORT || '587'),
 *   secure: false,
 *   auth: {
 *     user: process.env.SMTP_USER,
 *     pass: process.env.SMTP_PASSWORD,
 *   },
 * });
 * 
 * await transporter.sendMail({
 *   from: process.env.FROM_EMAIL || 'finance@y99.vn',
 *   to: data.customer_email,
 *   subject: subject,
 *   html: emailHTML,
 * });
 */

export async function POST(request: NextRequest) {
  try {
    // Parse FormData (supports both JSON and FormData)
    const contentType = request.headers.get("content-type") || "";
    let data: Partial<LoanDisbursementData> = {};
    let attachments: File[] = [];

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData with file uploads
      const formData = await request.formData();
      
      // Extract text fields
      data = {
        customer_name: formData.get("customer_name") as string,
        customer_email: formData.get("customer_email") as string,
        cc_emails: formData.get("cc_emails") as string | undefined,
        contract_code: formData.get("contract_code") as string,
        disbursement_amount: parseFloat(formData.get("disbursement_amount") as string),
        disbursement_date: formData.get("disbursement_date") as string,
        total_loan_amount: parseFloat(formData.get("total_loan_amount") as string),
        loan_term_months: parseInt(formData.get("loan_term_months") as string),
        loan_start_date: formData.get("loan_start_date") as string,
        loan_end_date: formData.get("loan_end_date") as string,
        due_day_each_month: parseInt(formData.get("due_day_each_month") as string),
        bank_name: formData.get("bank_name") as string,
        bank_account_number: formData.get("bank_account_number") as string,
        beneficiary_name: formData.get("beneficiary_name") as string,
      };

      // Extract files
      const files = formData.getAll("attachments") as File[];
      attachments = files.filter((file) => file instanceof File && file.size > 0);
    } else {
      // Handle JSON (backward compatibility)
      const jsonData = await request.json();
      data = jsonData;
      // Note: JSON cannot contain File objects, so attachments will be empty
      attachments = [];
    }

    // Validate required fields
    const requiredFields: (keyof LoanDisbursementData)[] = [
      "customer_name",
      "customer_email",
      "contract_code",
      "disbursement_amount",
      "disbursement_date",
      "total_loan_amount",
      "loan_term_months",
      "loan_start_date",
      "loan_end_date",
      "due_day_each_month",
      "bank_name",
      "bank_account_number",
      "beneficiary_name",
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Thiếu trường bắt buộc: ${field}` },
          { status: 400 }
        );
      }
    }

    // Type assertion after validation - all required fields are present
    const validatedData = data as LoanDisbursementData;

    // Validate email format - early return (rule 7.8)
    if (!EMAIL_REGEX.test(validatedData.customer_email)) {
      return NextResponse.json(
        { error: "Email TO không hợp lệ" },
        { status: 400 }
      );
    }

    // Parse and validate CC emails
    const ccEmails = parseCCEmails(validatedData.cc_emails);
    if (validatedData.cc_emails && ccEmails.length === 0) {
      return NextResponse.json(
        { error: "Tất cả email CC không hợp lệ" },
        { status: 400 }
      );
    }

    // Render email HTML
    const emailHTML = renderEmailHTML(validatedData);
    const subject = getEmailSubject(validatedData.contract_code);

    // Use after() for non-blocking logging (rule 3.7)
    after(async () => {
      // Logging happens after response is sent
      console.log("=== EMAIL SEND REQUEST ===");
      console.log("To:", validatedData.customer_email);
      if (ccEmails.length > 0) {
        console.log("CC:", ccEmails.join(", "));
      }
      if (attachments.length > 0) {
        console.log("Attachments:", attachments.map((f) => f.name).join(", "));
      }
      console.log("Subject:", subject);
      console.log("HTML Length:", emailHTML.length);
      console.log("========================");
    });

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Trong môi trường production, bạn sẽ gửi email thật ở đây:
    /*
    import nodemailer from 'nodemailer';
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Prepare attachments for email
    // Convert File objects to buffers for nodemailer
    const emailAttachments = await Promise.all(
      attachments.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        return {
          filename: file.name,
          content: Buffer.from(arrayBuffer),
          contentType: file.type || undefined,
        };
      })
    );

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'finance@y99.vn',
      to: validatedData.customer_email,
      ...(ccEmails.length > 0 && { cc: ccEmails.join(", ") }),
      subject: subject,
      html: emailHTML,
      ...(emailAttachments.length > 0 && { attachments: emailAttachments }),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    */

    return NextResponse.json({
      success: true,
      message: "Email đã được gửi thành công",
      data: {
        to: validatedData.customer_email,
        ...(ccEmails.length > 0 && { cc: ccEmails }),
        ...(attachments.length > 0 && {
          attachments: attachments.map((f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
          })),
        }),
        subject: subject,
        sentAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in send-email API:", error);
    return NextResponse.json(
      {
        error: "Lỗi khi xử lý yêu cầu gửi email",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
