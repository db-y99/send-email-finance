/**
 * Email template cho thông báo giải ngân khoản vay
 * Template này sử dụng placeholders {{field_name}} để render dữ liệu động
 */

import { LoanDisbursementData } from "@/types/loan-disbursement";
import { formatCurrency } from "./currency";

/**
 * Chuyển đổi số thành chữ tiếng Việt
 */
function numberToVietnameseWords(num: number): string {
  const ones = [
    "",
    "một",
    "hai",
    "ba",
    "bốn",
    "năm",
    "sáu",
    "bảy",
    "tám",
    "chín",
  ];
  const tens = [
    "",
    "mười",
    "hai mươi",
    "ba mươi",
    "bốn mươi",
    "năm mươi",
    "sáu mươi",
    "bảy mươi",
    "tám mươi",
    "chín mươi",
  ];
  const hundreds = [
    "",
    "một trăm",
    "hai trăm",
    "ba trăm",
    "bốn trăm",
    "năm trăm",
    "sáu trăm",
    "bảy trăm",
    "tám trăm",
    "chín trăm",
  ];

  if (num === 0) return "không";
  if (num < 10) return ones[num];
  if (num < 20) {
    if (num === 10) return "mười";
    if (num === 11) return "mười một";
    return "mười " + ones[num % 10];
  }
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    if (one === 0) return tens[ten];
    if (one === 5) return tens[ten] + " lăm";
    return tens[ten] + " " + ones[one];
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    if (remainder === 0) return hundreds[hundred];
    return hundreds[hundred] + " " + numberToVietnameseWords(remainder);
  }
  if (num < 1000000) {
    const thousand = Math.floor(num / 1000);
    const remainder = num % 1000;
    let result = numberToVietnameseWords(thousand) + " ngàn";
    if (remainder > 0) {
      if (remainder < 100) result += " không trăm";
      result += " " + numberToVietnameseWords(remainder);
    }
    return result;
  }
  if (num < 1000000000) {
    const million = Math.floor(num / 1000000);
    const remainder = num % 1000000;
    let result = numberToVietnameseWords(million) + " triệu";
    if (remainder > 0) {
      if (remainder < 1000) result += " không ngàn";
      result += " " + numberToVietnameseWords(remainder);
    }
    return result;
  }
  return num.toString();
}

/**
 * Format ngày tháng tiếng Việt
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Render email HTML từ template và dữ liệu
 * @param data - Dữ liệu giải ngân
 * @param logoUrl - URL của logo (optional, mặc định sẽ dùng /logo.png với base URL từ env)
 */
export function renderEmailHTML(
  data: LoanDisbursementData,
  logoUrl?: string
): string {
  const disbursementAmountWords = numberToVietnameseWords(data.disbursement_amount);
  const formattedDisbursementAmount = formatCurrency(data.disbursement_amount);
  const formattedTotalLoanAmount = formatCurrency(data.total_loan_amount);
  const formattedDisbursementDate = formatDate(data.disbursement_date);
  const formattedLoanStartDate = formatDate(data.loan_start_date);
  const formattedLoanEndDate = formatDate(data.loan_end_date);

  // Xác định logo URL - ưu tiên parameter, sau đó env variable, cuối cùng là default
  // Trong email HTML cần absolute URL để logo hiển thị được
  const getBaseUrl = () => {
    if (typeof process !== "undefined" && process.env) {
      return (
        process.env.NEXT_PUBLIC_BASE_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
        "https://y99.vn"
      );
    }
    return "https://y99.vn";
  };

  const logoImageUrl = logoUrl || `${getBaseUrl()}/logo.png`;

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thông báo Giải ngân Khoản vay</title>
    <style>
        body {
            font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .email-container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            margin-bottom: 30px;
        }
        .greeting {
            margin-bottom: 20px;
            font-size: 16px;
        }
        .content {
            margin-bottom: 30px;
        }
        .announcement {
            font-weight: bold;
            margin-bottom: 20px;
            font-size: 16px;
        }
        .section-title {
            font-weight: bold;
            margin-top: 25px;
            margin-bottom: 15px;
            color: #1a1a1a;
            font-size: 15px;
        }
        .detail-list {
            list-style: none;
            padding-left: 0;
            margin: 15px 0;
        }
        .detail-list li {
            margin-bottom: 10px;
            padding-left: 20px;
            position: relative;
        }
        .detail-list li:before {
            content: "•";
            position: absolute;
            left: 0;
            color: #0072F5;
            font-weight: bold;
            font-size: 18px;
        }
        .detail-label {
            font-weight: bold;
            display: inline-block;
            min-width: 180px;
        }
        .reminder {
            background-color: #f8f9fa;
            padding: 15px;
            border-left: 4px solid #0072F5;
            margin: 20px 0;
            border-radius: 4px;
        }
        .closing {
            margin-top: 30px;
            margin-bottom: 20px;
        }
        .no-reply-notice {
            font-size: 12px;
            color: #666666;
            font-style: italic;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
        }
        .company-signature {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 2px solid #e0e0e0;
            display: flex;
            align-items: flex-start;
            gap: 30px;
        }
        .company-logo {
            flex-shrink: 0;
        }
        .company-logo img {
            max-width: 120px;
            height: auto;
            display: block;
        }
        .company-info {
            flex: 1;
        }
        .company-name {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 15px;
        }
        .contact-info {
            font-size: 14px;
            line-height: 1.8;
        }
        .contact-info div {
            margin-bottom: 5px;
        }
        .contact-label {
            font-weight: bold;
            display: inline-block;
            min-width: 80px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="greeting">
                Kính gửi Ông/Bà: <strong>${data.customer_name}</strong>,
            </div>
        </div>

        <div class="content">
            <div class="announcement">
                DOANH NGHIỆP TƯ NHÂN Y99 xin trân trọng thông báo: khoản vay của Ông/Bà theo Hợp đồng số <strong>${data.contract_code}</strong> đã được giải ngân thành công.
            </div>

            <div class="section-title">Chi tiết giao dịch giải ngân như sau:</div>
            <ul class="detail-list">
                <li>
                    <span class="detail-label">Số tiền giải ngân:</span>
                    <strong>${formattedDisbursementAmount} VNĐ</strong> (Bằng chữ: ${disbursementAmountWords.charAt(0).toUpperCase() + disbursementAmountWords.slice(1)} đồng)
                </li>
                <li>
                    <span class="detail-label">Ngày giải ngân:</span>
                    ${formattedDisbursementDate}
                </li>
                <li>
                    <span class="detail-label">Tài khoản thụ hưởng:</span>
                    ${data.bank_account_number} ${data.bank_name}
                </li>
                <li>
                    <span class="detail-label">Người thụ hưởng:</span>
                    ${data.beneficiary_name}
                </li>
            </ul>

            <div class="section-title">Chúng tôi xin nhắc lại một số điều khoản chính của khoản vay:</div>
            <ul class="detail-list">
                <li>
                    <span class="detail-label">Tổng số vốn vay:</span>
                    <strong>${formattedTotalLoanAmount} VNĐ</strong>
                </li>
                <li>
                    <span class="detail-label">Thời hạn vay:</span>
                    ${data.loan_term_months} tháng (Từ ngày ${formattedLoanStartDate} đến ${formattedLoanEndDate})
                </li>
            </ul>

            <div class="reminder">
                <strong>Lưu ý:</strong> Kỳ trả nợ của Ông/Bà sẽ đến hạn vào ngày ${data.due_day_each_month} mỗi tháng. Vui lòng đảm bảo thanh toán đúng hạn để tránh phát sinh phí phạt.
            </div>
        </div>

        <div class="closing">
            Trân trọng.
        </div>

        <div class="no-reply-notice">
            Địa chỉ hộp thư này chỉ được sử dụng để gửi thông báo, không có chức năng tiếp nhận phản hồi.
        </div>

        <div class="company-signature">
            <div class="company-logo">
                <img src="${logoImageUrl}" alt="Y99 Logo" />
            </div>
            <div class="company-info">
                <div class="company-name">Doanh Nghiệp Tư Nhân Y99</div>
                <div class="contact-info">
                    <div>
                        <span class="contact-label">Điện thoại:</span>
                        1900 575 792 | +84 292 38 999 33 (Nước ngoài)
                    </div>
                    <div>
                        <span class="contact-label">Email:</span>
                        cskh@y99.vn
                    </div>
                    <div>
                        <span class="contact-label">Website:</span>
                        https://y99.vn/
                    </div>
                    <div>
                        <span class="contact-label">Địa chỉ:</span>
                        99B Nguyễn Trãi, Ninh Kiều, Cần Thơ
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `.trim();
}

/**
 * Tạo subject line cho email
 */
export function getEmailSubject(contractCode: string): string {
  return `[NO REPLY] Thông báo Giải ngân Khoản vay theo Hợp đồng số ${contractCode}`;
}
