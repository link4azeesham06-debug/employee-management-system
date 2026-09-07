import type { User } from "@supabase/supabase-js";

import { AppError } from "@/lib/errors/AppError";
import { getUserErrorMessage, normalizeError } from "@/lib/errors/normalizeError";
import { supabase } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validation/auth";
import { parseValidated } from "@/lib/validation/errors";
import type { Employee } from "@/types/employee";

export type AuthUser = {
  id: string;
  email: string;
  role: "admin" | "employee";
  employee?: Employee;
};

type ProfileRow = {
  id: string;
  email: string | null;
  role: string;
  employee_id: string | null;
};

type EmployeeRow = {
  id: string;
  employee_code: string | null;
  name: string | null;
  email: string | null;
  position: string | null;
  department_id: string | null;
  status: string | null;
  joined_date: string | null;
};

type DepartmentRow = {
  name: string | null;
};

export const DEMO_EMPLOYEE_EMAIL =
  "employee@hrpro.demo";

function normalizeEmployeeStatus(
  status: string | null
): Employee["status"] {
  const normalized = status?.trim().toLowerCase();

  if (normalized === "on leave" || normalized === "on_leave") {
    return "On Leave";
  }

  if (normalized === "inactive") {
    return "Inactive";
  }

  return "Active";
}

function mapEmployee(
  employee: EmployeeRow,
  departmentName: string
): Employee {
  return {
    id: employee.id,
    employeeId: employee.employee_code ?? "",
    name: employee.name ?? "",
    email: employee.email ?? "",
    position: employee.position ?? "",
    department: departmentName,
    status: normalizeEmployeeStatus(employee.status),
    joinedDate: employee.joined_date ?? "",
  };
}

export function getAuthErrorMessage(error: unknown): string {
  return getUserErrorMessage(
    error,
    "Unable to restore your session. Please sign in again.",
  );
}

export async function loadAuthUser(
  authenticatedUser: User
): Promise<AuthUser> {
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, role, employee_id")
    .eq("id", authenticatedUser.id)
    .single();

  if (profileError) {
    if (profileError.code === "PGRST116") {
      throw new AppError("NOT_FOUND", "Your account profile is not configured.", {
        cause: profileError,
        technicalMessage: profileError.message,
        metadata: { domain: "auth", resource: "profile" },
      });
    }

    throw normalizeError(profileError, {
      fallbackCode: "AUTH",
      fallbackMessage: "Unable to load your account profile.",
      messages: { FORBIDDEN: "Unable to access your account profile." },
      metadata: { domain: "auth", resource: "profile" },
    });
  }

  const profile = profileData as ProfileRow;

  if (profile.role !== "admin" && profile.role !== "employee") {
    throw new AppError("AUTH", "Your account is not configured for this application.", {
      technicalMessage: `Unsupported profile role: ${profile.role}`,
      metadata: { domain: "auth" },
    });
  }

  const email = profile.email ?? authenticatedUser.email;

  if (!email) {
    throw new AppError("AUTH", "Your account profile is incomplete.", {
      technicalMessage: "Authenticated account has no available email.",
      metadata: { domain: "auth" },
    });
  }

  if (profile.role === "admin") {
    return {
      id: authenticatedUser.id,
      email,
      role: "admin",
    };
  }

  if (!profile.employee_id) {
    throw new AppError("AUTH", "Your employee account is not fully configured.", {
      technicalMessage: "Employee profile has no employee_id linkage.",
      metadata: { domain: "auth", resource: "employee-link" },
    });
  }

  const { data: employeeData, error: employeeError } = await supabase
    .from("employees")
    .select(
      "id, employee_code, name, email, position, department_id, status, joined_date"
    )
    .eq("id", profile.employee_id)
    .single();

  if (employeeError) {
    if (employeeError.code === "PGRST116") {
      throw new AppError("NOT_FOUND", "Your linked employee record could not be loaded.", {
        cause: employeeError,
        technicalMessage: employeeError.message,
        metadata: { domain: "auth", resource: "employee" },
      });
    }
    throw normalizeError(employeeError, {
      fallbackCode: "AUTH",
      fallbackMessage: "Unable to load your employee account.",
      metadata: { domain: "auth", resource: "employee" },
    });
  }
  if (!employeeData) {
    throw new AppError("NOT_FOUND", "Your linked employee record could not be loaded.");
  }

  const employeeRow = employeeData as EmployeeRow;
  let departmentName = "";

  if (employeeRow.department_id) {
    const { data: departmentData, error: departmentError } = await supabase
      .from("departments")
      .select("name")
      .eq("id", employeeRow.department_id)
      .single();

    if (departmentError) {
      if (departmentError.code === "PGRST116") {
        throw new AppError("NOT_FOUND", "Your employee department could not be loaded.", {
          cause: departmentError,
          technicalMessage: departmentError.message,
          metadata: { domain: "auth", resource: "department" },
        });
      }
      throw normalizeError(departmentError, {
        fallbackCode: "AUTH",
        fallbackMessage: "Unable to load your employee department.",
        metadata: { domain: "auth", resource: "department" },
      });
    }
    if (!departmentData) {
      throw new AppError("NOT_FOUND", "Your employee department could not be loaded.");
    }

    departmentName = (departmentData as DepartmentRow).name ?? "";
  }

  return {
    id: authenticatedUser.id,
    email,
    role: "employee",
    employee: mapEmployee(employeeRow, departmentName),
  };
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw normalizeError(error, {
      fallbackCode: "AUTH",
      fallbackMessage: "Unable to restore your session. Please sign in again.",
      messages: { UNAUTHORIZED: "Your session has expired. Please sign in again." },
      metadata: { domain: "auth", action: "restore-session" },
    });
  }

  if (!session) {
    return null;
  }

  return loadAuthUser(session.user);
}

export async function loginUser(
  email: string,
  password: string
): Promise<AuthUser> {
  const credentials = parseValidated(loginSchema, { email, password });
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    if (error.code === "invalid_credentials" || error.message.toLowerCase().includes("invalid login credentials")) {
      throw new AppError("AUTH", "Invalid email or password.", {
        cause: error,
        technicalMessage: error.message,
        metadata: { domain: "auth", action: "login" },
      });
    }
    if (error.code === "email_not_confirmed" || error.message.toLowerCase().includes("email not confirmed")) {
      throw new AppError("AUTH", "Please confirm your email before signing in.", {
        cause: error,
        technicalMessage: error.message,
        metadata: { domain: "auth", action: "login" },
      });
    }
    throw normalizeError(error, {
      fallbackCode: "AUTH",
      fallbackMessage: "Unable to sign in. Please try again.",
      metadata: { domain: "auth", action: "login" },
    });
  }

  if (!data.user) {
    throw new AppError("AUTH", "Unable to sign in. Please try again.", {
      technicalMessage: "Supabase login returned no authenticated user.",
      metadata: { domain: "auth", action: "login" },
    });
  }

  try {
    return await loadAuthUser(data.user);
  } catch (error) {
    await supabase.auth.signOut();
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw normalizeError(error, {
      fallbackCode: "AUTH",
      fallbackMessage: "Unable to sign out. Please try again.",
      metadata: { domain: "auth", action: "logout" },
    });
  }
}
