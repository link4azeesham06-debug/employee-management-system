import { z, type ZodError, type ZodType } from "zod";

export type ValidationFieldErrors = Record<string, string>;

export type NormalizedValidationError = {
  message: string;
  fieldErrors: ValidationFieldErrors;
};

export class InputValidationError extends Error {
  readonly fieldErrors: ValidationFieldErrors;

  constructor(error: ZodError) {
    const normalized = normalizeValidationError(error);
    super(normalized.message);
    this.name = "InputValidationError";
    this.fieldErrors = normalized.fieldErrors;
  }
}

export function normalizeValidationError(
  error: ZodError,
): NormalizedValidationError {
  const fieldErrors: ValidationFieldErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }

  return {
    message: error.issues[0]?.message ?? "Please check the submitted values.",
    fieldErrors,
  };
}

export function parseValidated<TSchema extends ZodType>(
  schema: TSchema,
  input: unknown,
): z.output<TSchema> {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new InputValidationError(result.error);
  }

  return result.data;
}
