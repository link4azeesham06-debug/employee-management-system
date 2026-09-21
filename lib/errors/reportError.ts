import * as Sentry from "@sentry/nextjs";

import { AppError, type AppErrorCode } from "@/lib/errors/AppError";
import { normalizeError } from "@/lib/errors/normalizeError";

const REPORTABLE_CODES = new Set<AppErrorCode>([
  "UNKNOWN",
  "DATABASE",
  "NETWORK",
]);

const SENSITIVE_KEY_PATTERN =
  /authorization|cookie|credential|jwt|password|secret|session|token|api[-_]?key/i;
const MAX_METADATA_DEPTH = 3;
const MAX_ARRAY_ITEMS = 20;
const reportedErrors = new WeakSet<object>();

export type ErrorReportContext = {
  scope: string;
  route?: string;
  operation?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  force?: boolean;
};

export function sanitizeErrorText(value: string): string {
  return value
    .replace(/Bearer\s+[^\s]+/gi, "Bearer [Filtered]")
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[Filtered JWT]")
    .replace(/\bsb_secret_[A-Za-z0-9_-]+\b/gi, "[Filtered secret]")
    .replace(
      /((?:password|secret|token|api[-_]?key)\s*[=:]\s*)[^\s,;&]+/gi,
      "$1[Filtered]",
    );
}

function sanitizeValue(value: unknown, depth: number): unknown {
  if (value === null || typeof value === "boolean" || typeof value === "number") {
    return value;
  }
  if (typeof value === "string") return sanitizeErrorText(value);
  if (depth >= MAX_METADATA_DEPTH) return "[Truncated]";

  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_ARRAY_ITEMS)
      .map((item) => sanitizeValue(item, depth + 1));
  }

  if (value !== null && typeof value === "object") {
    return sanitizeErrorMetadata(value as Record<string, unknown>, depth + 1);
  }

  return String(value);
}

export function sanitizeErrorMetadata(
  metadata: Record<string, unknown> = {},
  depth = 0,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(metadata)
      .filter(
        ([key, value]) =>
          !SENSITIVE_KEY_PATTERN.test(key)
          && value !== undefined
          && typeof value !== "function"
          && typeof value !== "symbol",
      )
      .map(([key, value]) => [key, sanitizeValue(value, depth)]),
  );
}

export function shouldReportError(error: AppError): boolean {
  return REPORTABLE_CODES.has(error.code);
}

function monitoringError(normalized: AppError): Error {
  const reported = new Error(
    sanitizeErrorText(normalized.technicalMessage ?? normalized.userMessage),
  );
  reported.name = `${normalized.name}[${normalized.code}]`;

  if (normalized.stack) {
    reported.stack = sanitizeErrorText(normalized.stack);
  }

  return reported;
}

export function reportError(
  error: unknown,
  context: ErrorReportContext,
): AppError {
  const normalized = normalizeError(error);
  const reportable = context.force === true || shouldReportError(normalized);

  if (!reportable) return normalized;

  const identity = error !== null && typeof error === "object" ? error : normalized;
  if (reportedErrors.has(identity)) return normalized;
  reportedErrors.add(identity);

  const safeMetadata = sanitizeErrorMetadata({
    ...normalized.metadata,
    ...context.metadata,
  });
  const safeContext = sanitizeErrorMetadata({
    scope: context.scope,
    route: context.route,
    operation: context.operation,
    entityType: context.entityType,
    entityId: context.entityId,
  });

  if (process.env.NODE_ENV !== "production") {
    console.error(`[${context.scope}]`, {
      code: normalized.code,
      technicalMessage: sanitizeErrorText(
        normalized.technicalMessage ?? normalized.userMessage,
      ),
      metadata: safeMetadata,
    });
  }

  try {
    if (!Sentry.getClient()) return normalized;

    Sentry.withScope((scope) => {
      scope.setTag("app.error_code", normalized.code);
      scope.setTag("app.scope", context.scope);
      scope.setContext("application", safeContext);
      scope.setContext("metadata", safeMetadata);
      Sentry.captureException(monitoringError(normalized));
    });
  } catch (monitoringFailure) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Observability] Error reporting unavailable", {
        message: monitoringFailure instanceof Error
          ? sanitizeErrorText(monitoringFailure.message)
          : "Unknown monitoring failure",
      });
    }
  }

  return normalized;
}
