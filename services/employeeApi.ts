import { supabase } from "@/lib/supabase/client";
import { AppError } from "@/lib/errors/AppError";
import { normalizeError } from "@/lib/errors/normalizeError";
import {
  employeeCreateSchema,
  employeeUpdateSchema,
  type EmployeeCreateInput,
  type EmployeeUpdateInput,
} from "@/lib/validation/employee";
import { parseValidated } from "@/lib/validation/errors";
import type { Employee } from "@/types/employee";

type DepartmentRelation = {
  name: string | null;
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
  department: DepartmentRelation | DepartmentRelation[] | null;
};

type DepartmentRow = {
  id: string;
  name: string;
};

type ServiceError = {
  code?: string;
  message: string;
  details?: string | null;
};

const EMPLOYEE_SELECT = `
  id,
  employee_code,
  name,
  email,
  position,
  department_id,
  status,
  joined_date,
  department:departments!employees_department_id_fkey(name)
`;

function normalizeStatus(status: string | null): Employee["status"] {
  const normalized = status?.trim().toLowerCase();

  if (normalized === "on leave" || normalized === "on_leave") {
    return "On Leave";
  }

  if (normalized === "inactive") {
    return "Inactive";
  }

  return "Active";
}

function getDepartmentName(
  relation: EmployeeRow["department"]
): string {
  if (Array.isArray(relation)) {
    return relation[0]?.name ?? "";
  }

  return relation?.name ?? "";
}

function mapEmployee(row: EmployeeRow): Employee {
  return {
    id: row.id,
    employeeId: row.employee_code ?? "",
    name: row.name ?? "",
    email: row.email ?? "",
    position: row.position ?? "",
    department: getDepartmentName(row.department),
    status: normalizeStatus(row.status),
    joinedDate: row.joined_date ?? "",
  };
}

function throwServiceError(action: string, error: ServiceError): never {
  const errorText = `${error.message} ${error.details ?? ""}`.toLowerCase();

  if (error.code === "23505") {
    if (errorText.includes("employee_code")) {
      throw new AppError("CONFLICT", "An employee with this employee ID already exists.", { cause: error, technicalMessage: error.message });
    }

    if (errorText.includes("email")) {
      throw new AppError("CONFLICT", "An employee with this email already exists.", { cause: error, technicalMessage: error.message });
    }

    throw new AppError("CONFLICT", "An employee with these details already exists.", { cause: error, technicalMessage: error.message });
  }

  throw normalizeError(error, {
    fallbackCode: "DATABASE",
    fallbackMessage: `Unable to ${action} employee data.`,
    messages: {
      FORBIDDEN: `You do not have permission to ${action} employees.`,
      DATABASE: `Unable to ${action} employee data.`,
    },
    metadata: { domain: "employee", action },
  });
}

async function resolveDepartmentId(departmentName: string): Promise<string> {
  const { data, error } = await supabase
    .from("departments")
    .select("id, name");

  if (error) {
    throwServiceError("read", error);
  }

  const normalizedName = departmentName.trim().toLowerCase();
  const department = (data as DepartmentRow[]).find(
    (row) => row.name.trim().toLowerCase() === normalizedName
  );

  if (!department) {
    throw new AppError("VALIDATION", `Department "${departmentName.trim()}" was not found.`, {
      technicalMessage: "Employee mutation referenced an unknown department name.",
      metadata: { domain: "employee", field: "department" },
    });
  }

  return department.id;
}

export const getEmployees = async (): Promise<Employee[]> => {
  const { data, error } = await supabase
    .from("employees")
    .select(EMPLOYEE_SELECT)
    .order("name", { ascending: true });

  if (error) {
    throwServiceError("read", error);
  }

  return (data as unknown as EmployeeRow[]).map(mapEmployee);
};

export const addEmployee = async (
  employee: EmployeeCreateInput
): Promise<Employee> => {
  const validated = parseValidated(employeeCreateSchema, employee);
  const departmentId = await resolveDepartmentId(validated.department);
  const { data, error } = await supabase
    .from("employees")
    .insert({
      employee_code: validated.employeeId,
      name: validated.name,
      email: validated.email,
      position: validated.position,
      department_id: departmentId,
      status: validated.status,
      joined_date: validated.joinedDate,
    })
    .select(EMPLOYEE_SELECT)
    .single();

  if (error) {
    throwServiceError("create", error);
  }

  return mapEmployee(data as unknown as EmployeeRow);
};

export const updateEmployee = async (
  employee: EmployeeUpdateInput
): Promise<Employee> => {
  const validated = parseValidated(employeeUpdateSchema, employee);
  const departmentId = await resolveDepartmentId(validated.department);
  const { data, error } = await supabase
    .from("employees")
    .update({
      employee_code: validated.employeeId,
      name: validated.name,
      email: validated.email,
      position: validated.position,
      department_id: departmentId,
      status: validated.status,
      joined_date: validated.joinedDate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", validated.id)
    .select(EMPLOYEE_SELECT)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new AppError("NOT_FOUND", "Employee not found or update access was denied.", { cause: error, technicalMessage: error.message });
    }

    throwServiceError("update", error);
  }

  return mapEmployee(data as unknown as EmployeeRow);
};

export const deleteEmployee = async (id: string): Promise<void> => {
  const { data, error } = await supabase
    .from("employees")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    throwServiceError("delete", error);
  }

  if (!data?.length) {
    throw new AppError("NOT_FOUND", "Employee not found or delete access was denied.", { metadata: { domain: "employee", action: "delete" } });
  }
};
