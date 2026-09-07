import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors/AppError";

const supabaseMocks = vi.hoisted(() => ({
  from: vi.fn(),
  getUser: vi.fn(),
  getSession: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    from: supabaseMocks.from,
    auth: {
      getUser: supabaseMocks.getUser,
      getSession: supabaseMocks.getSession,
      signInWithPassword: supabaseMocks.signInWithPassword,
      signOut: supabaseMocks.signOut,
    },
  },
}));

import { loadAuthUser } from "@/services/authService";
import { addDepartment, deleteDepartment } from "@/services/departmentApi";
import { addEmployee, getEmployees } from "@/services/employeeApi";

type QueryResult = {
  data?: unknown;
  error?: { code?: string; message: string; details?: string | null } | null;
  count?: number | null;
};

function queryReturning(result: QueryResult) {
  const chain: Record<string, unknown> = {};
  for (const method of ["select", "order", "insert", "update", "delete", "eq", "ilike", "in", "not", "limit", "single"]) {
    chain[method] = vi.fn(() => chain);
  }
  chain.then = (
    resolve: (value: QueryResult) => unknown,
    reject: (reason: unknown) => unknown,
  ) => Promise.resolve(result).then(resolve, reject);
  return chain;
}

const authUser = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  email: "employee@example.com",
} as User;

beforeEach(() => {
  for (const mock of Object.values(supabaseMocks)) mock.mockReset();
});

describe("employee service", () => {
  it("maps a Supabase row into the frontend Employee domain", async () => {
    supabaseMocks.from.mockReturnValueOnce(queryReturning({
      data: [{
        id: "11111111-1111-4111-8111-111111111111",
        employee_code: "EMP-001",
        name: "Ada Lovelace",
        email: "ada@example.com",
        position: "Engineer",
        department_id: "department-id",
        status: "on_leave",
        joined_date: "2025-01-15",
        department: { name: "Engineering" },
      }],
      error: null,
    }));

    await expect(getEmployees()).resolves.toEqual([expect.objectContaining({
      employeeId: "EMP-001",
      department: "Engineering",
      status: "On Leave",
    })]);
  });

  it("normalizes a duplicate email database failure", async () => {
    supabaseMocks.from
      .mockReturnValueOnce(queryReturning({ data: [{ id: "department-id", name: "Engineering" }], error: null }))
      .mockReturnValueOnce(queryReturning({
        data: null,
        error: { code: "23505", message: "duplicate key", details: "employees_email_key" },
      }));

    await expect(addEmployee({
      employeeId: "EMP-100",
      name: "Ada Lovelace",
      email: "ada@example.com",
      position: "Engineer",
      department: "Engineering",
      status: "Active",
      joinedDate: "2026-01-15",
    })).rejects.toMatchObject({
      code: "CONFLICT",
      userMessage: "An employee with this email already exists.",
    });
  });
});

describe("department service", () => {
  it("rejects an unknown manager before inserting a department", async () => {
    supabaseMocks.from.mockReturnValueOnce(queryReturning({ data: [], error: null }));

    await expect(addDepartment({
      name: "Research",
      code: "RND",
      description: "Research",
      manager: "Missing Manager",
      status: "Active",
    })).rejects.toMatchObject({ code: "VALIDATION" });
    expect(supabaseMocks.from).toHaveBeenCalledTimes(1);
  });

  it("prevents deletion when employees are assigned", async () => {
    supabaseMocks.from.mockReturnValueOnce(queryReturning({ count: 2, error: null }));
    await expect(deleteDepartment("11111111-1111-4111-8111-111111111111"))
      .rejects.toEqual(expect.objectContaining<AppError>({ code: "CONFLICT" }));
    expect(supabaseMocks.from).toHaveBeenCalledTimes(1);
  });
});

describe("auth service", () => {
  it("maps profile, linked employee, and department records", async () => {
    supabaseMocks.from
      .mockReturnValueOnce(queryReturning({ data: { id: authUser.id, email: authUser.email, role: "employee", employee_id: "employee-id" }, error: null }))
      .mockReturnValueOnce(queryReturning({ data: { id: "employee-id", employee_code: "EMP-001", name: "Ada Lovelace", email: authUser.email, position: "Engineer", department_id: "department-id", status: "Active", joined_date: "2025-01-15" }, error: null }))
      .mockReturnValueOnce(queryReturning({ data: { name: "Engineering" }, error: null }));

    await expect(loadAuthUser(authUser)).resolves.toMatchObject({
      role: "employee",
      employee: { employeeId: "EMP-001", department: "Engineering" },
    });
  });

  it("returns a safe NOT_FOUND error for a missing profile", async () => {
    supabaseMocks.from.mockReturnValueOnce(queryReturning({
      data: null,
      error: { code: "PGRST116", message: "private PostgREST detail" },
    }));

    await expect(loadAuthUser(authUser)).rejects.toMatchObject({
      code: "NOT_FOUND",
      userMessage: "Your account profile is not configured.",
    });
  });
});
