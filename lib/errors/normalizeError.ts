import { AppError, type AppErrorCode } from "@/lib/errors/AppError";
import { InputValidationError } from "@/lib/validation/errors";

const DEFAULT_MESSAGES: Record<AppErrorCode, string> = {
  VALIDATION: "Please check the submitted values and try again.",
  UNAUTHORIZED: "Please sign in to continue.",
  FORBIDDEN: "You do not have permission to perform this action.",
  NOT_FOUND: "The requested record could not be found.",
  CONFLICT: "The requested change conflicts with existing data.",
  NETWORK: "Unable to reach the service. Check your connection and try again.",
  DATABASE: "The requested data operation could not be completed.",
  AUTH: "Unable to complete authentication. Please try again.",
  UNKNOWN: "Something unexpected happened. Please try again.",
};

type ErrorRecord = {
  code?: unknown;
  message?: unknown;
  status?: unknown;
  name?: unknown;
};

export type NormalizeErrorOptions = {
  fallbackCode?: AppErrorCode;
  fallbackMessage?: string;
  messages?: Partial<Record<AppErrorCode, string>>;
  metadata?: Record<string, unknown>;
};

function readError(error: unknown): ErrorRecord {
  return error !== null && typeof error === "object" ? error as ErrorRecord : {};
}

function technicalMessage(error: unknown): string | undefined {
  const record = readError(error);
  return typeof record.message === "string" ? record.message : undefined;
}

function classifyError(error: unknown): AppErrorCode {
  const record = readError(error);
  const code = typeof record.code === "string" ? record.code : "";
  const status = typeof record.status === "number" ? record.status : undefined;
  const name = typeof record.name === "string" ? record.name : "";
  const message = technicalMessage(error)?.toLowerCase() ?? "";

  if (code === "23505") return "CONFLICT";
  if (code === "23503") return "CONFLICT";
  if (code === "23514") return "VALIDATION";
  if (code === "42501" || status === 403) return "FORBIDDEN";
  if (code === "PGRST116") return "NOT_FOUND";
  if (code === "invalid_credentials" || code === "email_not_confirmed") return "AUTH";
  if (code === "session_not_found" || status === 401) return "UNAUTHORIZED";
  if (
    error instanceof TypeError ||
    name.includes("FetchError") ||
    name.includes("Network") ||
    message.includes("failed to fetch") ||
    message.includes("network request failed")
  ) {
    return "NETWORK";
  }
  if (code.startsWith("PGRST") || /^\d{5}$/.test(code)) return "DATABASE";

  return "UNKNOWN";
}

export function normalizeError(
  error: unknown,
  options: NormalizeErrorOptions = {},
): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof InputValidationError) {
    return new AppError("VALIDATION", error.message, {
      cause: error,
      technicalMessage: error.message,
      fieldErrors: error.fieldErrors,
      metadata: options.metadata,
    });
  }

  const classifiedCode = classifyError(error);
  const code = classifiedCode === "UNKNOWN" && options.fallbackCode
    ? options.fallbackCode
    : classifiedCode;
  const userMessage = options.messages?.[code]
    ?? (code === options.fallbackCode ? options.fallbackMessage : undefined)
    ?? DEFAULT_MESSAGES[code];

  return new AppError(code, userMessage, {
    cause: error,
    technicalMessage: technicalMessage(error),
    metadata: options.metadata,
  });
}

export function getUserErrorMessage(error: unknown, fallbackMessage?: string): string {
  return normalizeError(error, {
    fallbackCode: "UNKNOWN",
    fallbackMessage,
  }).userMessage;
}
