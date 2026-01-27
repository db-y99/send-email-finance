# Hệ thống Gửi Email Thông báo Giải ngân Khoản vay

## Tổng quan

Hệ thống này cho phép người dùng nhập thông tin giải ngân khoản vay và gửi email thông báo chuyên nghiệp đến khách hàng bằng tiếng Việt.

## Cấu trúc dự án

### 1. Schema & Types (`types/loan-disbursement.ts`)
- Định nghĩa interface `LoanDisbursementData` chứa tất cả các field cần thiết
- Bao gồm dữ liệu mẫu `sampleLoanDisbursementData` để test

### 2. Email Template (`lib/email-template.tsx`)
- Hàm `renderEmailHTML()`: Render email HTML từ template và dữ liệu
- Hàm `getEmailSubject()`: Tạo subject line cho email
- Các helper functions:
  - `numberToVietnameseWords()`: Chuyển số thành chữ tiếng Việt
  - `formatCurrency()`: Format số tiền VNĐ
  - `formatDate()`: Format ngày tháng tiếng Việt

### 3. Form Component (`components/loan-disbursement-form.tsx`)
- Form được chia thành 4 sections:
  - **Thông tin khách hàng**: Tên, email, số hợp đồng
  - **Thông tin giải ngân**: Số tiền, ngày giải ngân
  - **Thông tin khoản vay**: Tổng vốn vay, thời hạn, ngày bắt đầu/kết thúc, ngày đến hạn
  - **Thông tin ngân hàng**: Tên ngân hàng, số tài khoản, người thụ hưởng
- Validation đầy đủ cho tất cả các field
- Có nút "Xem trước email" và "Gửi email"

### 4. Email Preview Modal (`components/email-preview-modal.tsx`)
- Hiển thị preview email trong iframe
- Hiển thị thông tin người nhận và subject
- Có thể gửi email trực tiếp từ preview

### 5. Main Page (`app/disbursement/page.tsx`)
- Trang chính chứa form và xử lý logic
- Tích hợp với API route để gửi email
- Có nút "Tải dữ liệu mẫu" để test nhanh

### 6. API Route (`app/api/send-email/route.ts`)
- Endpoint POST `/api/send-email`
- Validate dữ liệu đầu vào
- Render email HTML và gửi email (hiện tại chỉ log, chưa tích hợp SMTP thật)

### 7. Email Sender Utilities (`lib/email-sender.ts`)
- Pseudocode và hướng dẫn tích hợp với các email service:
  - Nodemailer
  - SendGrid
  - AWS SES
  - Resend
- Helper function `validateEmailData()` để validate dữ liệu trước khi gửi

## Cách sử dụng

### 1. Truy cập form
- Navigate đến `/disbursement` trong ứng dụng

### 2. Điền thông tin
- Điền đầy đủ các field trong form
- Form sẽ validate tự động khi người dùng nhập

### 3. Xem trước email
- Click nút "Xem trước email" để xem email sẽ được gửi
- Có thể chỉnh sửa lại form nếu cần

### 4. Gửi email
- Click nút "Gửi email" để gửi
- Hệ thống sẽ gọi API và gửi email đến khách hàng

## Tích hợp SMTP thật

### Option 1: Nodemailer (Recommended cho development)

1. Cài đặt:
```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

2. Thêm vào `.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=finance@y99.vn
```

3. Cập nhật `app/api/send-email/route.ts`:
```typescript
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

// Trong hàm POST:
const info = await transporter.sendMail({
  from: process.env.FROM_EMAIL || 'finance@y99.vn',
  to: data.customer_email,
  subject: subject,
  html: emailHTML,
});
```

### Option 2: SendGrid

1. Cài đặt:
```bash
npm install @sendgrid/mail
```

2. Thêm vào `.env`:
```
SENDGRID_API_KEY=your-api-key
FROM_EMAIL=finance@y99.vn
```

3. Xem pseudocode trong `lib/email-sender.ts`

### Option 3: AWS SES

1. Cài đặt:
```bash
npm install @aws-sdk/client-ses
```

2. Thêm vào `.env`:
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
FROM_EMAIL=finance@y99.vn
```

3. Xem pseudocode trong `lib/email-sender.ts`

### Option 4: Resend (Modern & Recommended)

1. Cài đặt:
```bash
npm install resend
```

2. Thêm vào `.env`:
```
RESEND_API_KEY=your-api-key
FROM_EMAIL=finance@y99.vn
```

3. Xem pseudocode trong `lib/email-sender.ts`

## Cấu trúc Email Template

Email được render với các phần chính:

1. **Header**: Greeting với tên khách hàng
2. **Announcement**: Thông báo giải ngân thành công
3. **Disbursement Details**: Chi tiết giải ngân (số tiền, ngày, tài khoản, người thụ hưởng)
4. **Loan Terms**: Điều khoản khoản vay (tổng vốn, thời hạn)
5. **Payment Reminder**: Nhắc nhở kỳ trả nợ
6. **Closing**: Trân trọng
7. **No-Reply Notice**: Thông báo không nhận phản hồi
8. **Company Signature**: Thông tin liên hệ công ty

## Dữ liệu mẫu

File `types/loan-disbursement.ts` chứa `sampleLoanDisbursementData` với dữ liệu mẫu để test:
- Khách hàng: Nguyễn Thành Phong
- Số hợp đồng: AP261025021
- Số tiền giải ngân: 2,700,000 VNĐ
- Tổng vốn vay: 3,000,000 VNĐ
- Thời hạn: 6 tháng

## Validation Rules

- **customer_name**: Required, không được để trống
- **customer_email**: Required, phải đúng format email
- **contract_code**: Required
- **disbursement_amount**: Required, phải > 0
- **disbursement_date**: Required, phải là date hợp lệ
- **total_loan_amount**: Required, phải > 0
- **loan_term_months**: Required, phải > 0
- **loan_start_date**: Required
- **loan_end_date**: Required
- **due_day_each_month**: Required, phải từ 1-31
- **bank_name**: Required
- **bank_account_number**: Required
- **beneficiary_name**: Required

## Testing

1. Sử dụng nút "Tải dữ liệu mẫu" để load dữ liệu test
2. Click "Xem trước email" để kiểm tra format email
3. Trong development, email sẽ được log ra console thay vì gửi thật

## Notes

- Email template sử dụng inline CSS để đảm bảo tương thích với các email client
- Subject line format: `[NO REPLY] Thông báo Giải ngân Khoản vay theo Hợp đồng số {contract_code}`
- Số tiền được format theo chuẩn Việt Nam (dấu chấm phân cách hàng nghìn)
- Ngày tháng được format theo định dạng DD/MM/YYYY

## Future Enhancements

- [ ] Thêm tính năng attach PDF (hợp đồng, biên lai)
- [ ] Thêm template email khác (nhắc nhở thanh toán, cảnh báo quá hạn)
- [ ] Thêm tính năng gửi email hàng loạt
- [ ] Thêm logging và tracking email đã gửi
- [ ] Thêm tính năng preview trên mobile
- [ ] Thêm tính năng lưu draft email
