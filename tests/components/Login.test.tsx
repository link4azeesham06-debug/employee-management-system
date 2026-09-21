// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LoginPage from "@/app/login/page";

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
  auth: {
    user: null as { id: string; email: string; role: "admin" } | null,
    loading: false,
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, replace: mocks.replace }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    login: mocks.login,
    error: null,
    user: mocks.auth.user,
    loading: mocks.auth.loading,
  }),
}));

vi.mock("react-hot-toast", () => ({
  default: { error: mocks.toastError, success: mocks.toastSuccess },
}));

vi.mock("@/services/authService", () => ({
  DEMO_EMPLOYEE_EMAIL: "employee@example.test",
}));

describe("LoginPage", () => {
  beforeEach(() => {
    mocks.login.mockReset();
    mocks.push.mockReset();
    mocks.replace.mockReset();
    mocks.toastError.mockReset();
    mocks.toastSuccess.mockReset();
    mocks.auth.user = null;
    mocks.auth.loading = false;
  });

  it("blocks malformed email before calling authentication", () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText("Email");
    fireEvent.change(emailInput, { target: { value: "bad-email" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(emailInput).toBeInvalid();
    expect(mocks.login).not.toHaveBeenCalled();
  });

  it("redirects an authenticated user away from the login page", () => {
    mocks.auth.user = {
      id: "admin-user",
      email: "admin@example.test",
      role: "admin",
    };

    render(<LoginPage />);

    expect(mocks.replace).toHaveBeenCalledWith("/dashboard");
    expect(screen.getByRole("status")).toHaveTextContent("Loading your workspace");
  });
});
