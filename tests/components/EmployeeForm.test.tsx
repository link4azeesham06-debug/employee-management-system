// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import EmployeeForm from "@/components/employee/EmployeeForm";

describe("EmployeeForm", () => {
  it("renders schema field errors for invalid input", () => {
    render(<EmployeeForm addEmployee={vi.fn()} updateEmployee={vi.fn()} editingEmployee={null} />);
    fireEvent.click(screen.getByRole("button", { name: "Save employee" }));
    expect(screen.getAllByText("Name must contain at least 2 characters.").length).toBeGreaterThan(0);
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Position is required.")).toBeInTheDocument();
    expect(screen.getByText("Department is required.")).toBeInTheDocument();
  });

  it("submits a valid normalized payload", () => {
    const addEmployee = vi.fn();
    render(<EmployeeForm addEmployee={addEmployee} updateEmployee={vi.fn()} editingEmployee={null} />);
    fireEvent.change(screen.getByLabelText(/Full name/), { target: { value: "  Ada Lovelace  " } });
    fireEvent.change(screen.getByLabelText(/Email address/), { target: { value: "  ADA@EXAMPLE.COM  " } });
    fireEvent.change(screen.getByLabelText(/Position/), { target: { value: " Engineer " } });
    fireEvent.change(screen.getByLabelText(/Department/), { target: { value: " Engineering " } });
    fireEvent.click(screen.getByRole("button", { name: "Save employee" }));
    expect(addEmployee).toHaveBeenCalledWith(expect.objectContaining({
      name: "Ada Lovelace",
      email: "ada@example.com",
      position: "Engineer",
      department: "Engineering",
      status: "Active",
    }));
  });
});
