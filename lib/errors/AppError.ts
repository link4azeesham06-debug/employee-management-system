import type { ValidationFieldErrors } from "@/lib/validation/errors";

export const APP_ERROR_CODES = [
  "VALIDATION",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "NETWORK",
  "DATABASE",
  "AUTH",
  "UNKNOWN",
] as const;

export type AppErrorCode = (typeof APP_ERROR_CODES)[number];

type AppErrorOptions = {
  cause?: unknown;
  technicalMessage?: string;
  fieldErrors?: ValidationFieldErrors;
  metadata?: Record<string, unknown>;
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly userMessage: string;
  readonly technicalMessage?: string;
  readonly fieldErrors?: ValidationFieldErrors;
  readonly metadata?: Record<string, unknown>;
  readonly cause?: unknown;

  constructor(code: AppErrorCode, userMessage: string, options: AppErrorOptions = {}) {
    super(userMessage);
    this.name = "AppError";
    this.code = code;
    this.userMessage = userMessage;
    this.technicalMessage = options.technicalMessage;
    this.fieldErrors = options.fieldErrors;
    this.metadata = options.metadata;
    this.cause = options.cause;
  }
}
