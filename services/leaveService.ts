import { AppError } from "@/lib/errors/AppError";
import { normalizeError } from "@/lib/errors/normalizeError";
import { supabase } from "@/lib/supabase/client";
import {
  leaveDecisionSchema,
  leaveRequestCreateSchema,
  type LeaveRequestCreateInput,
} from "@/lib/validation/leave";
import { parseValidated } from "@/lib/validation/errors";
import type {
  LeaveDecision,
  LeaveRequest,
  LeaveStatus,
  LeaveType,
} from "@/types/leave";

type ProfileRow = {
  id: string;
  role: string;
  employee_id: string | null;
};

type LeaveRow = {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

type AuthenticatedProfile = {
  userId: string;
  role: "admin" | "employee";
  employeeId?: string;
};

const LEAVE_SELECT = [
  "id",
  "employee_id",
  "leave_type",
  "start_date",
  "end_date",
  "reason",
  "status",
  "reviewed_by",
  "reviewed_at",
  "created_at",
  "updated_at",
].join(", ");

function leaveError(
  error: { code?: string; message: string },
  action: string,
): AppError {
  return normalizeError(error, {
    fallbackCode: "DATABASE",
    fallbackMessage: `Unable to ${action} leave requests.`,
    messages: {
      FORBIDDEN: "You do not have permission to perform this leave action.",
      NOT_FOUND: "The leave request is unavailable.",
      VALIDATION: "The leave request does not satisfy the required rules.",
      DATABASE: `Unable to ${action} leave requests.`,
    },
    metadata: { domain: "leave", action },
  });
}

function leaveReviewError(error: { code?: string; message: string }): AppError {
  const metadata = { domain: "leave", action: "review" };

  if (error.message.includes("LEAVE_REVIEW_FORBIDDEN")) {
    return new AppError("FORBIDDEN", "Only administrators can review leave requests.", {
      cause: error,
      technicalMessage: error.message,
      metadata,
    });
  }

  if (error.message.includes("LEAVE_AUTH_REQUIRED")) {
    return new AppError("UNAUTHORIZED", "Please sign in to review leave requests.", {
      cause: error,
      technicalMessage: error.message,
      metadata,
    });
  }

  if (error.message.includes("LEAVE_REQUEST_NOT_FOUND")) {
    return new AppError("NOT_FOUND", "The leave request is unavailable.", {
      cause: error,
      technicalMessage: error.message,
      metadata,
    });
  }

  if (error.message.includes("LEAVE_RECIPIENT_NOT_FOUND")) {
    return new AppError(
      "NOT_FOUND",
      "The employee notification recipient is unavailable.",
      { cause: error, technicalMessage: error.message, metadata },
    );
  }

  if (error.message.includes("LEAVE_ALREADY_REVIEWED")) {
    return new AppError("CONFLICT", "Only pending leave requests can be reviewed.", {
      cause: error,
      technicalMessage: error.message,
      metadata,
    });
  }

  if (error.message.includes("LEAVE_INVALID_DECISION")) {
    return new AppError("VALIDATION", "Select a valid leave decision.", {
      cause: error,
      technicalMessage: error.message,
      metadata,
    });
  }

  return leaveError(error, "review");
}

function normalizeLeaveType(value: string): LeaveType {
  if (
    value === "Annual"
    || value === "Sick"
    || value === "Personal"
    || value === "Unpaid"
  ) {
    return value;
  }

  throw new AppError("DATABASE", "A leave request contains an unsupported leave type.");
}

function normalizeLeaveStatus(value: string): LeaveStatus {
  if (value === "Pending" || value === "Approved" || value === "Rejected") {
    return value;
  }

  throw new AppError("DATABASE", "A leave request contains an unsupported status.");
}

function mapLeaveRequest(row: LeaveRow): LeaveRequest {
  return {
    id: row.id,
    employeeId: row.employee_id,
    leaveType: normalizeLeaveType(row.leave_type),
    startDate: row.start_date,
    endDate: row.end_date,
    reason: row.reason,
    status: normalizeLeaveStatus(row.status),
    reviewedBy: row.reviewed_by ?? undefined,
    reviewedAt: row.reviewed_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getAuthenticatedProfile(): Promise<AuthenticatedProfile> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw normalizeError(userError, {
      fallbackCode: "AUTH",
      fallbackMessage: "Unable to verify your leave-management session.",
      metadata: { domain: "leave", action: "authenticate" },
    });
  }

  if (!user) {
    throw new AppError("UNAUTHORIZED", "Please sign in to access leave management.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, employee_id")
    .eq("id", user.id)
    .single();

  if (error) throw leaveError(error, "load your profile for");

  const profile = data as ProfileRow;
  if (profile.role !== "admin" && profile.role !== "employee") {
    throw new AppError("FORBIDDEN", "Your account cannot access leave management.");
  }

  if (profile.role === "employee" && !profile.employee_id) {
    throw new AppError(
      "FORBIDDEN",
      "Your account is not linked to an employee record.",
    );
  }

  return {
    userId: user.id,
    role: profile.role,
    employeeId: profile.employee_id ?? undefined,
  };
}

export async function getCurrentEmployeeLeaveRequests(): Promise<LeaveRequest[]> {
  const profile = await getAuthenticatedProfile();

  if (profile.role !== "employee" || !profile.employeeId) {
    throw new AppError("FORBIDDEN", "Only employees can load personal leave requests.");
  }

  const { data, error } = await supabase
    .from("leave_requests")
    .select(LEAVE_SELECT)
    .eq("employee_id", profile.employeeId)
    .order("created_at", { ascending: false });

  if (error) throw leaveError(error, "load");
  return ((data ?? []) as unknown as LeaveRow[]).map(mapLeaveRequest);
}

export async function getAllLeaveRequests(): Promise<LeaveRequest[]> {
  const profile = await getAuthenticatedProfile();

  if (profile.role !== "admin") {
    throw new AppError("FORBIDDEN", "Only administrators can view all leave requests.");
  }

  const { data, error } = await supabase
    .from("leave_requests")
    .select(LEAVE_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw leaveError(error, "load");
  return ((data ?? []) as unknown as LeaveRow[]).map(mapLeaveRequest);
}

export async function createLeaveRequest(
  input: LeaveRequestCreateInput,
): Promise<LeaveRequest> {
  const validated = parseValidated(leaveRequestCreateSchema, input);
  const profile = await getAuthenticatedProfile();

  if (profile.role !== "employee" || !profile.employeeId) {
    throw new AppError("FORBIDDEN", "Only employees can submit leave requests.");
  }

  const { data, error } = await supabase
    .from("leave_requests")
    .insert({
      employee_id: profile.employeeId,
      leave_type: validated.leaveType,
      start_date: validated.startDate,
      end_date: validated.endDate,
      reason: validated.reason,
    })
    .select(LEAVE_SELECT)
    .single();

  if (error) throw leaveError(error, "submit");
  return mapLeaveRequest(data as unknown as LeaveRow);
}

async function reviewLeaveRequest(
  id: string,
  status: LeaveDecision,
): Promise<LeaveRequest> {
  const decision = parseValidated(leaveDecisionSchema, { id, status });
  const { data, error } = await supabase.rpc("review_leave_request", {
    p_leave_request_id: decision.id,
    p_decision: decision.status,
  });

  if (error) throw leaveReviewError(error);
  if (!data) {
    throw new AppError("DATABASE", "Unable to review leave requests.", {
      metadata: { domain: "leave", action: "review" },
    });
  }

  return mapLeaveRequest(data as unknown as LeaveRow);
}

export function approveLeaveRequest(id: string): Promise<LeaveRequest> {
  return reviewLeaveRequest(id, "Approved");
}

export function rejectLeaveRequest(id: string): Promise<LeaveRequest> {
  return reviewLeaveRequest(id, "Rejected");
}
