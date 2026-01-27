/**
 * Error factory for creating plain object errors (Rule 0.0 & 7.0 in error-handling.mdc)
 */

import { ERROR_CODES } from "@/constants/error-codes";
import { AppErrorObject } from "@/types/result.types";

export const createError = {
  validation: (message: string, details?: unknown): AppErrorObject => ({
    code: ERROR_CODES.VALIDATION,
    message,
    statusCode: 400,
    details,
  }),
  notFound: (message: string): AppErrorObject => ({
    code: ERROR_CODES.NOT_FOUND,
    message,
    statusCode: 404,
  }),
  database: (message: string): AppErrorObject => ({
    code: ERROR_CODES.DATABASE,
    message,
    statusCode: 500,
  }),
  unauthorized: (message = "Unauthorized"): AppErrorObject => ({
    code: ERROR_CODES.UNAUTHORIZED,
    message,
    statusCode: 401,
  }),
  server: (message: string): AppErrorObject => ({
    code: ERROR_CODES.SERVER_ERROR,
    message,
    statusCode: 500,
  }),
  email: (message: string): AppErrorObject => ({
    code: ERROR_CODES.EMAIL_SEND_FAILED,
    message,
    statusCode: 500,
  }),
};
