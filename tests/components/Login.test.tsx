// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LoginPage from "@/app/login/page";

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  push: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ login: mocks.login, error: null }),
}));

vi.mock("react-hot-toast", () => ({
  default: { error: mocks.toastError, success: mocks.toastSuccess },
}));

vi.mock("@/services/authService", () => ({
  DEMO_EMPLOYEE_EMAIL: "employee@example.test",
}));

describe("LoginPage", () => {
  beforeEach(() => {
    for (const mock of Object.values(mocks)) mock.mockReset();
  });

  it("blocks malformed email before calling authentication", () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText("Email");
    fireEvent.change(emailInput, { target: { value: "bad-email" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password" } });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));
    expect(emailInput).toBeInvalid();
    expect(mocks.login).not.toHaveBeenCalled();
  });
});
