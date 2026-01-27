/**
 * Email utilities
 */

import { EMAIL_REGEX } from "@/constants/email";

/**
 * Parse và validate CC emails từ string (comma-separated)
 * Returns array of valid emails only
 */
export function parseCCEmails(ccEmails?: string): string[] {
  if (!ccEmails?.trim()) return [];
  return ccEmails
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email && EMAIL_REGEX.test(email));
}

/**
 * Parse CC emails từ string (comma-separated) without validation
 * Returns all emails including invalid ones (for form display)
 */
export function parseCCEmailsRaw(ccEmails?: string): string[] {
  if (!ccEmails?.trim()) return [];
  return ccEmails
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}
