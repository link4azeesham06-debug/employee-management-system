import { describe, expect, it } from "vitest";

import { loginSchema } from "@/lib/validation/auth";
import { departmentCreateSchema } from "@/lib/validation/department";
import { employeeCreateSchema, employeeUpdateSchema } from "@/lib/validation/employee";
import { notificationCreateSchema } from "@/lib/validation/notification";

const validEmployee = {
  employeeId: "EMP-100",
  name: "Ada Lovelace",
  email: "ada@example.com",
  position: "Engineer",
  department: "Engineering",
  status: "Active" as const,
  joinedDate: "2026-01-15",
};

const validDepartment = {
  name: "Engineering",
  code: "ENG",
  description: "Product engineering",
  manager: "Ada Lovelace",
  status: "Active" as const,
};

describe("employee validation", () => {
  it("accepts create and update payloads", () => {
    expect(employeeCreateSchema.safeParse(validEmployee).success).toBe(true);
    expect(employeeUpdateSchema.safeParse({
      ...validEmployee,
      id: "11111111-1111-4111-8111-111111111111",
    }).success).toBe(true);
  });

  it("normalizes text and email without changing display casing", () => {
    const result = employeeCreateSchema.parse({
      ...validEmployee,
      name: "  Ada Lovelace  ",
      email: "  ADA@EXAMPLE.COM  ",
      position: "  Senior Engineer  ",
    });
    expect(result).toMatchObject({
      name: "Ada Lovelace",
      email: "ada@example.com",
      position: "Senior Engineer",
    });
  });

  it.each([
    ["blank name", { name: " " }],
    ["malformed email", { email: "not-an-email" }],
    ["invalid status", { status: "Suspended" }],
    ["invalid joined date", { joinedDate: "2026-02-30" }],
    ["missing department", { department: " " }],
  ])("rejects %s", (_label, change) => {
    expect(employeeCreateSchema.safeParse({ ...validEmployee, ...change }).success).toBe(false);
  });
});

describe("department validation", () => {
  it("accepts a valid payload and normalizes its code", () => {
    const result = departmentCreateSchema.parse({ ...validDepartment, code: " eng " });
    expect(result.code).toBe("ENG");
  });

  it.each([
    ["blank name", { name: " " }],
    ["blank code", { code: " " }],
    ["invalid status", { status: "Archived" }],
  ])("rejects %s", (_label, change) => {
    expect(departmentCreateSchema.safeParse({ ...validDepartment, ...change }).success).toBe(false);
  });
});

describe("authentication validation", () => {
  it("accepts and normalizes a valid login shape", () => {
    expect(loginSchema.parse({ email: " ADMIN@HR.COM ", password: "secret" })).toEqual({
      email: "admin@hr.com",
      password: "secret",
    });
  });

  it("rejects malformed email and a missing password", () => {
    expect(loginSchema.safeParse({ email: "bad", password: "secret" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "admin@hr.com", password: "" }).success).toBe(false);
  });
});

describe("notification validation", () => {
  it("rejects unsupported types", () => {
    expect(notificationCreateSchema.safeParse({
      title: "Update",
      message: "Employee changed",
      type: "other",
      read: false,
    }).success).toBe(false);
  });

  it("rejects blank required fields", () => {
    expect(notificationCreateSchema.safeParse({
      title: " ",
      message: " ",
      type: "info",
      read: false,
    }).success).toBe(false);
  });
});
