import { describe, expect, it } from "vitest";

import { normalizeError } from "@/lib/errors/normalizeError";
import { loginSchema } from "@/lib/validation/auth";
import { InputValidationError } from "@/lib/validation/errors";

describe("normalizeError", () => {
  it.each([
    ["23505", "CONFLICT"],
    ["23503", "CONFLICT"],
    ["23514", "VALIDATION"],
    ["42501", "FORBIDDEN"],
    ["PGRST116", "NOT_FOUND"],
  ] as const)("maps %s to %s without exposing raw details", (sourceCode, expectedCode) => {
    const rawMessage = `private database detail for ${sourceCode}`;
    const result = normalizeError({ code: sourceCode, message: rawMessage });
    expect(result.code).toBe(expectedCode);
    expect(result.userMessage).not.toContain(rawMessage);
    expect(result.technicalMessage).toBe(rawMessage);
  });

  it("maps fetch failures to NETWORK", () => {
    const result = normalizeError(new TypeError("Failed to fetch"));
    expect(result.code).toBe("NETWORK");
    expect(result.userMessage).toContain("Check your connection");
  });

  it("preserves field errors from InputValidationError", () => {
    const parsed = loginSchema.safeParse({ email: "bad", password: "" });
    if (parsed.success) throw new Error("Expected invalid login fixture");
    const result = normalizeError(new InputValidationError(parsed.error));
    expect(result.code).toBe("VALIDATION");
    expect(result.fieldErrors).toMatchObject({
      email: expect.any(String),
      password: expect.any(String),
    });
  });

  it("maps unknown errors safely while retaining technical context", () => {
    const result = normalizeError(new Error("internal implementation detail"));
    expect(result.code).toBe("UNKNOWN");
    expect(result.userMessage).toBe("Something unexpected happened. Please try again.");
    expect(result.technicalMessage).toBe("internal implementation detail");
  });
});
