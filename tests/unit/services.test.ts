import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

const supabaseMocks = vi.hoisted(() => ({
  from: vi.fn(),
  getUser: vi.fn(),
  getSession: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  rpc: vi.fn(),
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
    rpc: supabaseMocks.rpc,
  },
}));

import { loadAuthUser } from "@/services/authService";
import { addDepartment, deleteDepartment } from "@/services/departmentApi";
import { addEmployee, getEmployees } from "@/services/employeeApi";
import {
  approveLeaveRequest,
  createLeaveRequest,
  rejectLeaveRequest,
} from "@/services/leaveService";

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
      .rejects.toMatchObject({ code: "CONFLICT" });
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

describe("leave service", () => {
  const pendingLeave = {
    id: "22222222-2222-4222-8222-222222222222",
    employee_id: "employee-id",
    leave_type: "Annual",
    start_date: "2026-10-12",
    end_date: "2026-10-16",
    reason: "Family travel plans",
    status: "Pending",
    reviewed_by: null,
    reviewed_at: null,
    created_at: "2026-09-07T09:00:00.000Z",
    updated_at: "2026-09-07T09:00:00.000Z",
  };

  it("derives employee ownership from the authenticated profile", async () => {
    const insertQuery = queryReturning({ data: pendingLeave, error: null });
    supabaseMocks.getUser.mockResolvedValue({ data: { user: authUser }, error: null });
    supabaseMocks.from
      .mockReturnValueOnce(queryReturning({
        data: { id: authUser.id, role: "employee", employee_id: "employee-id" },
        error: null,
      }))
      .mockReturnValueOnce(insertQuery);

    await expect(createLeaveRequest({
      leaveType: "Annual",
      startDate: "2026-10-12",
      endDate: "2026-10-16",
      reason: "Family travel plans",
    })).resolves.toMatchObject({ employeeId: "employee-id", status: "Pending" });

    expect(insertQuery.insert).toHaveBeenCalledWith({
      employee_id: "employee-id",
      leave_type: "Annual",
      start_date: "2026-10-12",
      end_date: "2026-10-16",
      reason: "Family travel plans",
    });
  });

  it("approves through one RPC without client-supplied actor or recipient IDs", async () => {
    supabaseMocks.rpc.mockResolvedValue({
      data: { ...pendingLeave, status: "Approved", reviewed_by: authUser.id },
      error: null,
    });

    await expect(approveLeaveRequest(pendingLeave.id)).resolves.toMatchObject({
      id: pendingLeave.id,
      status: "Approved",
    });
    expect(supabaseMocks.rpc).toHaveBeenCalledWith("review_leave_request", {
      p_leave_request_id: pendingLeave.id,
      p_decision: "Approved",
    });
    expect(supabaseMocks.from).not.toHaveBeenCalled();
  });

  it("rejects through the review RPC", async () => {
    supabaseMocks.rpc.mockResolvedValue({
      data: { ...pendingLeave, status: "Rejected", reviewed_by: authUser.id },
      error: null,
    });

    await expect(rejectLeaveRequest(pendingLeave.id)).resolves.toMatchObject({
      status: "Rejected",
    });
    expect(supabaseMocks.rpc).toHaveBeenCalledWith("review_leave_request", {
      p_leave_request_id: pendingLeave.id,
      p_decision: "Rejected",
    });
  });

  it("maps an already-reviewed RPC failure to a conflict", async () => {
    supabaseMocks.rpc.mockResolvedValue({
      data: null,
      error: { code: "P0001", message: "LEAVE_ALREADY_REVIEWED" },
    });

    await expect(approveLeaveRequest(pendingLeave.id)).rejects.toMatchObject({
      code: "CONFLICT",
      userMessage: "Only pending leave requests can be reviewed.",
    });
  });

  it("maps database authorization failures without exposing raw details", async () => {
    supabaseMocks.rpc.mockResolvedValue({
      data: null,
      error: { code: "42501", message: "LEAVE_REVIEW_FORBIDDEN" },
    });

    await expect(approveLeaveRequest(pendingLeave.id)).rejects.toMatchObject({
      code: "FORBIDDEN",
      userMessage: "Only administrators can review leave requests.",
    });
  });
});
