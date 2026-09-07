import { supabase } from "@/lib/supabase/client";
import { AppError } from "@/lib/errors/AppError";
import { normalizeError } from "@/lib/errors/normalizeError";
import {
  departmentCreateSchema,
  departmentUpdateSchema,
  type DepartmentCreateInput,
  type DepartmentUpdateInput,
} from "@/lib/validation/department";
import { parseValidated } from "@/lib/validation/errors";
import type { Department, DepartmentStatus } from "@/types/department";

type RelatedEmployee = { name: string | null };

type DepartmentRow = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: string;
  manager_id: string | null;
  created_at: string;
  manager: RelatedEmployee | RelatedEmployee[] | null;
};

type EmployeeDepartmentRow = { department_id: string | null };

const DEPARTMENT_SELECT = `
  id,
  name,
  code,
  description,
  status,
  manager_id,
  created_at,
  manager:employees!departments_manager_fk(name)
`;

function normalizeStatus(status: string): DepartmentStatus {
  return status === "Inactive" ? "Inactive" : "Active";
}

function getManagerName(manager: DepartmentRow["manager"]): string {
  const record = Array.isArray(manager) ? manager[0] : manager;
  return record?.name?.trim() ?? "";
}

function mapDepartment(row: DepartmentRow, employeeCount: number): Department {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description ?? "",
    manager: getManagerName(row.manager),
    status: normalizeStatus(row.status),
    employeeCount,
    createdAt: row.created_at,
  };
}

function getDepartmentError(error: {
  code?: string;
  message: string;
}): AppError {
  if (error.code === "23505") {
    const field = error.message.toLowerCase().includes("code") ? "code" : "name";
    return new AppError("CONFLICT", `A department with this ${field} already exists.`, {
      cause: error,
      technicalMessage: error.message,
    });
  }

  return normalizeError(error, {
    fallbackCode: "DATABASE",
    fallbackMessage: "Unable to complete the department operation.",
    messages: {
      FORBIDDEN: "You do not have permission to manage departments.",
      CONFLICT: "This department change conflicts with existing employee assignments.",
      VALIDATION: "The department data does not satisfy the required constraints.",
      DATABASE: "Unable to complete the department operation.",
    },
    metadata: { domain: "department" },
  });
}

async function resolveManagerId(managerName: string): Promise<string | null> {
  const normalizedName = managerName.trim();
  if (!normalizedName) return null;

  const { data, error } = await supabase
    .from("employees")
    .select("id, name")
    .ilike("name", normalizedName);

  if (error) throw getDepartmentError(error);

  const manager = data?.find(
    (employee) => employee.name.trim().toLowerCase() === normalizedName.toLowerCase(),
  );

  if (!manager) {
    throw new AppError("VALIDATION", `Employee manager "${normalizedName}" was not found.`, {
      technicalMessage: "Department mutation referenced an unknown employee manager.",
      metadata: { domain: "department", field: "manager" },
    });
  }

  return manager.id;
}

async function getEmployeeCount(departmentId: string): Promise<number> {
  const { count, error } = await supabase
    .from("employees")
    .select("id", { count: "exact", head: true })
    .eq("department_id", departmentId);

  if (error) throw getDepartmentError(error);
  return count ?? 0;
}

async function getDepartmentById(id: string): Promise<Department> {
  const [{ data, error }, employeeCount] = await Promise.all([
    supabase.from("departments").select(DEPARTMENT_SELECT).eq("id", id).single(),
    getEmployeeCount(id),
  ]);

  if (error) throw getDepartmentError(error);
  return mapDepartment(data as DepartmentRow, employeeCount);
}

export async function getDepartments(): Promise<Department[]> {
  const [departmentResult, employeeResult] = await Promise.all([
    supabase.from("departments").select(DEPARTMENT_SELECT).order("name"),
    supabase.from("employees").select("department_id"),
  ]);

  if (departmentResult.error) {
    throw getDepartmentError(departmentResult.error);
  }
  if (employeeResult.error) {
    throw getDepartmentError(employeeResult.error);
  }

  const counts = new Map<string, number>();
  (employeeResult.data as EmployeeDepartmentRow[] | null)?.forEach(({ department_id }) => {
    if (department_id) {
      counts.set(department_id, (counts.get(department_id) ?? 0) + 1);
    }
  });

  return ((departmentResult.data ?? []) as DepartmentRow[]).map((department) =>
    mapDepartment(department, counts.get(department.id) ?? 0),
  );
}

export async function addDepartment(
  department: DepartmentCreateInput,
): Promise<Department> {
  const validated = parseValidated(departmentCreateSchema, department);
  const managerId = await resolveManagerId(validated.manager);
  const { data, error } = await supabase
    .from("departments")
    .insert({
      name: validated.name,
      code: validated.code,
      description: validated.description || null,
      status: validated.status,
      manager_id: managerId,
    })
    .select("id")
    .single();

  if (error) throw getDepartmentError(error);
  return getDepartmentById(data.id);
}

export async function updateDepartment(department: DepartmentUpdateInput): Promise<Department> {
  const validated = parseValidated(departmentUpdateSchema, department);
  const managerId = await resolveManagerId(validated.manager);
  const { data, error } = await supabase
    .from("departments")
    .update({
      name: validated.name,
      code: validated.code,
      description: validated.description || null,
      status: validated.status,
      manager_id: managerId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", validated.id)
    .select("id")
    .single();

  if (error) throw getDepartmentError(error);
  return getDepartmentById(data.id);
}

export async function deleteDepartment(id: string): Promise<void> {
  const employeeCount = await getEmployeeCount(id);
  if (employeeCount > 0) {
    throw new AppError("CONFLICT", "This department cannot be deleted while employees are assigned to it.", {
      metadata: { domain: "department", action: "delete" },
    });
  }

  const { data, error } = await supabase
    .from("departments")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) throw getDepartmentError(error);
  if (!data?.length) {
    throw new AppError("NOT_FOUND", "Department was not found or could not be deleted.", {
      metadata: { domain: "department", action: "delete" },
    });
  }
}
