"use client";

import { useState, useTransition } from "react";
import { LoanDisbursementForm } from "@/components/loan-disbursement-form";
import { EmailPreviewModal } from "@/components/email-preview-modal";
import { LoanDisbursementData } from "@/types/loan-disbursement";
import { Button } from "@heroui/button";
import { title } from "@/components/primitives";
import { sampleLoanDisbursementData } from "@/types/loan-disbursement";

// Hoist static JSX elements (rule 6.3)
const LoadingOverlay = (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
      <p>Đang gửi email...</p>
    </div>
  </div>
);

export default function DisbursementPage() {
  const [formData, setFormData] = useState<LoanDisbursementData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  // Use useTransition instead of manual loading state (rule 6.9)
  const [isPending, startTransition] = useTransition();

  const handlePreview = (data: LoanDisbursementData) => {
    setFormData(data);
    setIsPreviewOpen(true);
  };

  const handleSubmit = async (data: LoanDisbursementData) => {
    startTransition(async () => {
      try {
        // Tạo FormData để gửi cả data và files
        const formData = new FormData();
        
        // Thêm các field text vào FormData
        Object.entries(data).forEach(([key, value]) => {
          if (key !== "attachments" && value !== undefined) {
            if (value instanceof File || value instanceof FileList) {
              // Skip files, sẽ thêm riêng
              return;
            }
            formData.append(key, String(value));
          }
        });

        // Thêm attachments nếu có
        if (data.attachments && data.attachments.length > 0) {
          data.attachments.forEach((file) => {
            formData.append("attachments", file);
          });
        }

        // Gọi API để gửi email với FormData
        const response = await fetch("/api/send-email", {
          method: "POST",
          // Không set Content-Type header, browser sẽ tự động set với boundary cho FormData
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          alert(`Email đã được gửi thành công đến ${data.customer_email}`);
          // Reset form sau khi gửi thành công
          window.location.reload();
        } else {
          const error = await response.json();
          alert(`Lỗi khi gửi email: ${error.message || "Unknown error"}`);
        }
      } catch (error) {
        console.error("Error sending email:", error);
        alert("Đã có lỗi xảy ra khi gửi email. Vui lòng thử lại.");
      }
    });
  };

  const handleSendFromPreview = () => {
    if (formData) {
      handleSubmit(formData);
      setIsPreviewOpen(false);
    }
  };

  const handleLoadSample = () => {
    setFormData(sampleLoanDisbursementData);
    setIsPreviewOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className={title()}>Gửi email thông báo giải ngân khoản vay</h1>
        <p className="text-default-600 mt-4">
          Điền thông tin giải ngân khoản vay để gửi email thông báo cho khách hàng.
        </p>
      </div>

      <div className="mb-4 flex justify-end">
        <Button
          variant="bordered"
          size="sm"
          onPress={handleLoadSample}
        >
          Tải dữ liệu mẫu
        </Button>
      </div>

      <LoanDisbursementForm
        onSubmit={handleSubmit}
        onPreview={handlePreview}
        initialData={formData || undefined}
      />

      <EmailPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={formData}
        onSend={handleSendFromPreview}
      />

      {/* Explicit conditional rendering (rule 6.8) - use ternary instead of && */}
      {isPending ? LoadingOverlay : null}
    </div>
  );
}
