/**
 * Currency formatting utilities
 */

/**
 * Format số tiền với dấu chấm phân cách hàng nghìn (1.000.000)
 * Dùng cho input fields
 */
export function formatCurrencyInput(value: number | undefined): string {
  if (value === undefined || value === null || isNaN(value)) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Parse số tiền từ string có dấu chấm (1.000.000 -> 1000000)
 * Dùng cho input fields
 */
export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/\./g, "").trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format số tiền VNĐ với Intl.NumberFormat (dùng cho email template)
 * Format: 1.000.000 VNĐ
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount);
}
