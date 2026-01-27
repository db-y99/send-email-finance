"use client";

import { useState, useCallback, useRef, FormEvent, useEffect } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { LoanDisbursementData } from "@/types/loan-disbursement";
import { EmailRecipientInput } from "./email-recipient-input";
import { EMAIL_REGEX } from "@/constants/email";
import { MAX_FILE_SIZE, ACCEPTED_FILE_TYPES } from "@/constants/files";
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/currency";
import { parseCCEmailsRaw } from "@/lib/email";

interface LoanDisbursementFormProps {
  onSubmit: (data: LoanDisbursementData) => void;
  onPreview: (data: LoanDisbursementData) => void;
  initialData?: Partial<LoanDisbursementData>;
}

interface FormErrors {
  [key: string]: string | undefined;
}

/**
 * Hoist validation logic ra ngoài component (rule 5.5, 7.8)
 * Early return pattern để tránh unnecessary computation
 */
function validateFormData(
  formData: Partial<LoanDisbursementData>,
  toEmailsArray: string[],
  ccEmailsArray: string[]
): FormErrors {
  const errors: FormErrors = {};

  // Validate TO emails - early return pattern (rule 7.8)
  if (toEmailsArray.length === 0) {
    errors.customer_email = "Vui lòng nhập ít nhất một email TO";
  } else {
    const invalidEmails = toEmailsArray.filter(
      (email) => !EMAIL_REGEX.test(email)
    );
    if (invalidEmails.length > 0) {
      errors.customer_email = "Email TO không hợp lệ";
    }
  }

  // Validate CC emails - optional but must be valid if provided
  if (ccEmailsArray.length > 0) {
    const invalidCCEmails = ccEmailsArray.filter(
      (email) => !EMAIL_REGEX.test(email)
    );
    if (invalidCCEmails.length > 0) {
      errors.cc_emails = "Một hoặc nhiều email CC không hợp lệ";
    }
  }

  // Required fields validation - early return pattern
  if (!formData.customer_name?.trim()) {
    errors.customer_name = "Vui lòng nhập họ và tên khách hàng";
  }
  if (!formData.contract_code?.trim()) {
    errors.contract_code = "Vui lòng nhập số hợp đồng";
  }
  if (!formData.disbursement_amount || formData.disbursement_amount <= 0) {
    errors.disbursement_amount = "Vui lòng nhập số tiền giải ngân hợp lệ";
  }
  if (!formData.disbursement_date) {
    errors.disbursement_date = "Vui lòng chọn ngày giải ngân";
  }
  if (!formData.total_loan_amount || formData.total_loan_amount <= 0) {
    errors.total_loan_amount = "Vui lòng nhập tổng số vốn vay hợp lệ";
  }
  if (!formData.loan_term_months || formData.loan_term_months <= 0) {
    errors.loan_term_months = "Vui lòng nhập thời hạn vay hợp lệ";
  }
  if (!formData.loan_start_date) {
    errors.loan_start_date = "Vui lòng chọn ngày bắt đầu vay";
  }
  if (!formData.loan_end_date) {
    errors.loan_end_date = "Vui lòng chọn ngày kết thúc vay";
  }
  if (
    !formData.due_day_each_month ||
    formData.due_day_each_month < 1 ||
    formData.due_day_each_month > 31
  ) {
    errors.due_day_each_month =
      "Vui lòng nhập ngày đến hạn hàng tháng (1-31)";
  }
  if (!formData.bank_name?.trim()) {
    errors.bank_name = "Vui lòng nhập tên ngân hàng";
  }
  if (!formData.bank_account_number?.trim()) {
    errors.bank_account_number = "Vui lòng nhập số tài khoản";
  }
  if (!formData.beneficiary_name?.trim()) {
    errors.beneficiary_name = "Vui lòng nhập tên người thụ hưởng";
  }

  return errors;
}


export function LoanDisbursementForm({
  onSubmit,
  onPreview,
  initialData,
}: LoanDisbursementFormProps) {
  // Lazy state initialization (rule 5.10)
  const [formData, setFormData] = useState<Partial<LoanDisbursementData>>(() =>
    initialData || {}
  );

  const [errors, setErrors] = useState<FormErrors>({});
  const [toEmailsArray, setToEmailsArray] = useState<string[]>(() => {
    return initialData?.customer_email ? [initialData.customer_email] : [];
  });
  const [ccEmailsArray, setCcEmailsArray] = useState<string[]>(() => {
    return initialData?.cc_emails
      ? parseCCEmailsRaw(initialData.cc_emails)
      : [];
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.customer_email) {
        setToEmailsArray([initialData.customer_email]);
      }
      if (initialData.cc_emails) {
        setCcEmailsArray(parseCCEmailsRaw(initialData.cc_emails));
      }
    }
  }, [initialData]);

  // Update field helper - functional setState (rule 5.9)
  // Không cần errors dependency vì dùng functional update
  const updateField = useCallback(
    (field: keyof LoanDisbursementData, value: string | number) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error when user types - functional setState
      setErrors((prev) => {
        if (prev[field]) {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        }
        return prev;
      });
    },
    [] // No dependencies needed với functional setState
  );

  // Handle file change - functional setState (rule 5.9)
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const validFiles: File[] = [];

      files.forEach((file) => {
        // Validate file size (max 10MB)
        if (file.size > MAX_FILE_SIZE) {
          alert(`File ${file.name} quá lớn. Kích thước tối đa là 10MB.`);
          return;
        }
        validFiles.push(file);
      });

      // Functional setState update
      setAttachments((prev) => [...prev, ...validFiles]);
    },
    []
  );

  // Remove attachment - functional setState (rule 5.9)
  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Validation - hoisted function, no dependencies needed
  const validate = useCallback((): boolean => {
    const newErrors = validateFormData(formData, toEmailsArray, ccEmailsArray);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, toEmailsArray, ccEmailsArray]);

  // Helper để build submit data - hoisted logic
  const buildSubmitData = useCallback(
    (): LoanDisbursementData => {
      const toEmail = toEmailsArray[0] || "";
      const ccEmailsString =
        ccEmailsArray.length > 0 ? ccEmailsArray.join(", ") : undefined;

      return {
        ...formData,
        customer_email: toEmail,
        cc_emails: ccEmailsString,
        attachments: attachments.length > 0 ? attachments : undefined,
      } as LoanDisbursementData;
    },
    [formData, toEmailsArray, ccEmailsArray, attachments]
  );

  // Handle submit - functional setState pattern (rule 5.9)
  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!validate()) return;

      onSubmit(buildSubmitData());
    },
    [validate, buildSubmitData, onSubmit]
  );

  // Handle preview - functional setState pattern (rule 5.9)
  const handlePreview = useCallback(() => {
    if (!validate()) return;
    onPreview(buildSubmitData());
  }, [validate, buildSubmitData, onPreview]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Thông tin khách hàng */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Thông tin khách hàng</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Họ và tên khách hàng"
            value={formData.customer_name || ""}
            onChange={(e) => updateField("customer_name", e.target.value)}
            isInvalid={!!errors.customer_name}
            errorMessage={errors.customer_name}
            isRequired
          />
          <EmailRecipientInput
            label="Email khách hàng (TO)"
            value={toEmailsArray}
            onChange={setToEmailsArray}
            isInvalid={!!errors.customer_email}
            errorMessage={errors.customer_email}
            isRequired
            suggestions={[]}
            placeholder="Nhập email TO..."
          />
          <EmailRecipientInput
            label="CC (Tùy chọn)"
            value={ccEmailsArray}
            onChange={setCcEmailsArray}
            isInvalid={!!errors.cc_emails}
            errorMessage={errors.cc_emails}
            description="Nhập email và nhấn Enter để thêm. Có thể paste nhiều email cách nhau bởi dấu phẩy."
            suggestions={[]}
            placeholder="Nhập email CC..."
          />
          <Input
            label="Số hợp đồng"
            value={formData.contract_code || ""}
            onChange={(e) => updateField("contract_code", e.target.value)}
            isInvalid={!!errors.contract_code}
            errorMessage={errors.contract_code}
            isRequired
          />
        </CardBody>
      </Card>

      {/* Thông tin giải ngân */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Thông tin giải ngân</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Số tiền giải ngân (VNĐ)"
            type="text"
            value={formatCurrencyInput(formData.disbursement_amount)}
            onChange={(e) => {
              const parsed = parseCurrencyInput(e.target.value);
              updateField("disbursement_amount", parsed);
            }}
            isInvalid={!!errors.disbursement_amount}
            errorMessage={errors.disbursement_amount}
            isRequired
          />
          <Input
            label="Ngày giải ngân"
            type="date"
            value={formData.disbursement_date || ""}
            onChange={(e) => updateField("disbursement_date", e.target.value)}
            isInvalid={!!errors.disbursement_date}
            errorMessage={errors.disbursement_date}
            isRequired
          />
        </CardBody>
      </Card>

      {/* Thông tin khoản vay */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Thông tin khoản vay</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Tổng số vốn vay (VNĐ)"
            type="text"
            value={formatCurrencyInput(formData.total_loan_amount)}
            onChange={(e) => {
              const parsed = parseCurrencyInput(e.target.value);
              updateField("total_loan_amount", parsed);
            }}
            isInvalid={!!errors.total_loan_amount}
            errorMessage={errors.total_loan_amount}
            isRequired
          />
          <Input
            label="Thời hạn vay (tháng)"
            type="number"
            value={formData.loan_term_months?.toString() || ""}
            onChange={(e) =>
              updateField("loan_term_months", parseInt(e.target.value) || 0)
            }
            isInvalid={!!errors.loan_term_months}
            errorMessage={errors.loan_term_months}
            isRequired
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Ngày bắt đầu vay"
              type="date"
              value={formData.loan_start_date || ""}
              onChange={(e) => updateField("loan_start_date", e.target.value)}
              isInvalid={!!errors.loan_start_date}
              errorMessage={errors.loan_start_date}
              isRequired
            />
            <Input
              label="Ngày kết thúc vay"
              type="date"
              value={formData.loan_end_date || ""}
              onChange={(e) => updateField("loan_end_date", e.target.value)}
              isInvalid={!!errors.loan_end_date}
              errorMessage={errors.loan_end_date}
              isRequired
            />
          </div>
          <Input
            label="Ngày đến hạn hàng tháng"
            type="number"
            min="1"
            max="31"
            value={formData.due_day_each_month?.toString() || ""}
            onChange={(e) =>
              updateField("due_day_each_month", parseInt(e.target.value) || 0)
            }
            isInvalid={!!errors.due_day_each_month}
            errorMessage={errors.due_day_each_month}
            isRequired
            description="Nhập số từ 1 đến 31"
          />
        </CardBody>
      </Card>

      {/* Thông tin ngân hàng */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Thông tin ngân hàng</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Tên ngân hàng"
            value={formData.bank_name || ""}
            onChange={(e) => updateField("bank_name", e.target.value)}
            isInvalid={!!errors.bank_name}
            errorMessage={errors.bank_name}
            isRequired
          />
          <Input
            label="Số tài khoản"
            value={formData.bank_account_number || ""}
            onChange={(e) => updateField("bank_account_number", e.target.value)}
            isInvalid={!!errors.bank_account_number}
            errorMessage={errors.bank_account_number}
            isRequired
          />
          <Input
            label="Tên người thụ hưởng"
            value={formData.beneficiary_name || ""}
            onChange={(e) => updateField("beneficiary_name", e.target.value)}
            isInvalid={!!errors.beneficiary_name}
            errorMessage={errors.beneficiary_name}
            isRequired
          />
        </CardBody>
      </Card>

      {/* File đính kèm */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">File đính kèm</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept={ACCEPTED_FILE_TYPES}
            />
            <Button
              type="button"
              variant="bordered"
              onPress={() => fileInputRef.current?.click()}
            >
              Chọn file đính kèm
            </Button>
            <p className="text-xs text-default-500 mt-2">
              Kích thước tối đa mỗi file: 10MB. Định dạng hỗ trợ: PDF, DOC,
              DOCX, XLS, XLSX, JPG, PNG
            </p>
          </div>
          {attachments.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Các file đã chọn:</p>
              <ul className="space-y-1">
                {attachments.map((file, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-2 bg-default-100 rounded"
                  >
                    <span className="text-sm">
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => removeAttachment(index)}
                    >
                      Xóa
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardBody>
      </Card>

      {/* Action buttons */}
      <div className="flex gap-4 justify-end">
        <Button type="button" variant="bordered" onPress={handlePreview}>
          Xem trước email
        </Button>
        <Button type="submit" color="primary">
          Gửi email
        </Button>
      </div>
    </form>
  );
}
