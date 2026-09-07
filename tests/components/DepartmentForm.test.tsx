// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import DepartmentForm from "@/components/departments/DepartmentForm";

vi.mock("@/hooks/useEmployees", () => ({
  useEmployees: () => ({ employees: [] }),
}));

describe("DepartmentForm", () => {
  it("renders required schema errors and does not submit", () => {
    const onSubmit = vi.fn();
    render(<DepartmentForm open department={null} onClose={vi.fn()} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: "Create department" }));
    expect(screen.getAllByText("Department name is required.").length).toBeGreaterThan(0);
    expect(screen.getByText("Department code is required.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
