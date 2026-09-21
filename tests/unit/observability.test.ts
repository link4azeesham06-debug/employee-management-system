import { beforeEach, describe, expect, it, vi } from "vitest";

const sentryMocks = vi.hoisted(() => ({
  captureException: vi.fn(),
  getClient: vi.fn(),
  withScope: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => sentryMocks);

import { AppError } from "@/lib/errors/AppError";
import {
  reportError,
  sanitizeErrorMetadata,
} from "@/lib/errors/reportError";

const scope = {
  setTag: vi.fn(),
  setContext: vi.fn(),
};

beforeEach(() => {
  sentryMocks.captureException.mockReset();
  sentryMocks.getClient.mockReset().mockReturnValue({});
  sentryMocks.withScope.mockReset().mockImplementation((callback) => callback(scope));
  scope.setTag.mockReset();
  scope.setContext.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
});

describe("production error reporting", () => {
  it("does not report expected validation errors as critical exceptions", () => {
    reportError(
      new AppError("VALIDATION", "Check the submitted values."),
      { scope: "EmployeeForm.submit" },
    );

    expect(sentryMocks.captureException).not.toHaveBeenCalled();
  });

  it("reports unexpected unknown errors", () => {
    reportError(new Error("Unexpected failure"), {
      scope: "Dashboard.load",
      route: "/dashboard",
    });

    expect(sentryMocks.captureException).toHaveBeenCalledOnce();
    expect(scope.setTag).toHaveBeenCalledWith("app.error_code", "UNKNOWN");
  });

  it("reports the same error object only once", () => {
    const error = new Error("Repeated failure");

    reportError(error, { scope: "Dashboard.load" });
    reportError(error, { scope: "Dashboard.load" });

    expect(sentryMocks.captureException).toHaveBeenCalledOnce();
  });

  it("removes credentials and redacts secret-like text from metadata", () => {
    expect(sanitizeErrorMetadata({
      employeeId: "employee-id",
      password: "private-password",
      nested: {
        accessToken: "private-token",
        message: "Authorization: Bearer abc.def.ghi",
      },
    })).toEqual({
      employeeId: "employee-id",
      nested: {
        message: "Authorization: Bearer [Filtered]",
      },
    });
  });

  it("does not throw when monitoring is not configured", () => {
    sentryMocks.getClient.mockReturnValue(undefined);

    expect(() => reportError(new Error("Unavailable monitor"), {
      scope: "Application.start",
    })).not.toThrow();
    expect(sentryMocks.captureException).not.toHaveBeenCalled();
  });
});
