"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { Employee } from "@/types/employee";
import type { EmployeeCreateInput } from "@/lib/validation/employee";
import { AppError } from "@/lib/errors/AppError";
import { logAppError, normalizeError } from "@/lib/errors/normalizeError";

import {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from "@/services/employeeApi";

import { getEmployeeStats } from "@/utils/employeeStats";

import { useAudit } from "@/context/AuditContext";
import { useNotifications } from "@/context/NotificationContext";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/utils/permissions";

type EmployeeContextType = {
  employees: Employee[];

  loading: boolean;

  stats: ReturnType<typeof getEmployeeStats>;

  refreshEmployees: () => Promise<void>;

  createEmployee: (
    employee: EmployeeCreateInput
  ) => Promise<void>;

  editEmployee: (
    employee: Employee
  ) => Promise<void>;

  removeEmployee: (
    id: string
  ) => Promise<void>;
};

export const EmployeeContext =
  createContext<EmployeeContextType | null>(null);

export function EmployeeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [loading, setLoading] =
    useState(true);

  const { addLog } = useAudit();

  const { addNotification } =
    useNotifications();

  const { user } = useAuth();

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  function getPerformer() {
    return {
      name:
        user?.employee?.name ??
        user?.email ??
        "System User",

      role:
        user?.role ?? "employee",
    };
  }

  async function addAuditLogSafely(
    input: Parameters<typeof addLog>[0],
  ): Promise<void> {
    try {
      await addLog(input);
    } catch (error) {
      logAppError("EmployeeContext.audit", error);
    }
  }

  function ensureUniqueEmployeeEmail(employee: EmployeeCreateInput | Employee) {
    const duplicate = employees.some(
      (current) =>
        current.email.toLowerCase() === employee.email.toLowerCase() &&
        (!("id" in employee) || current.id !== employee.id),
    );

    if (duplicate) {
      throw new AppError("CONFLICT", "An employee with this email already exists.", {
        metadata: { domain: "employee", field: "email" },
      });
    }
  }

  // --------------------------------------------------
  // Load Employees
  // --------------------------------------------------

  const refreshEmployees = useCallback(async () => {
    try {
      setLoading(true);

      if (!user) {
        setEmployees([]);
        return;
      }

      const data = await getEmployees();

      if (user.role === "admin") {
        setEmployees(data);
        return;
      }

      const employeeRecordId = user.employee?.id ?? user.id;
      const employeeEmail = user.email.toLowerCase();

      setEmployees(
        data.filter(
          (employee) =>
            employee.id === employeeRecordId ||
            employee.email.toLowerCase() === employeeEmail,
        ),
      );
    } catch (error) {
      const normalized = normalizeError(error, {
        fallbackCode: "DATABASE",
        fallbackMessage: "Unable to load employees.",
      });
      logAppError("EmployeeContext.refreshEmployees", normalized);
      throw normalized;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // --------------------------------------------------
  // Create Employee
  // --------------------------------------------------

  async function createEmployee(
    employee: EmployeeCreateInput
  ) {
    if (!user || !hasPermission(user.role, "canCreateEmployee")) {
      throw new AppError("FORBIDDEN", "Only administrators can create employees.");
    }
    ensureUniqueEmployeeEmail(employee);
    const created =
      await addEmployee(employee);

    setEmployees((previous) => [
      ...previous,
      created,
    ]);

    const performer =
      getPerformer();

    // Audit
    await addAuditLogSafely({
      action: "CREATE",
      entity: "Employee",
      entityId: created.id,
      description:
        `Created employee ${created.name}`,
      performedBy: performer.name,
      performedByRole: performer.role,
      metadata: { employeeName: created.name },
    });

    // Notification
    await addNotification(
      "Employee Added",
      `${created.name} was added to the employee directory.`,
      "success",
      `/employees/${created.id}`
    );
  }

  // --------------------------------------------------
  // Update Employee
  // --------------------------------------------------

  async function editEmployee(
    employee: Employee
  ) {
    if (!user || !hasPermission(user.role, "canEditEmployee")) {
      throw new AppError("FORBIDDEN", "Only administrators can update employees.");
    }
    ensureUniqueEmployeeEmail(employee);
    const previousEmployee =
      employees.find(
        (emp) => emp.id === employee.id
      );

    const updated =
      await updateEmployee(employee);

    setEmployees((previous) =>
      previous.map((emp) =>
        emp.id === updated.id
          ? updated
          : emp
      )
    );

    const performer =
      getPerformer();

    const statusChanged =
      previousEmployee !== undefined &&
      previousEmployee.status !==
        updated.status;

    // Audit
    await addAuditLogSafely({
      action: statusChanged
        ? "STATUS_CHANGE"
        : "UPDATE",

      entity: "Employee",

      entityId: updated.id,

      description: statusChanged
        ? `Changed ${updated.name}'s status from ${previousEmployee.status} to ${updated.status}`
        : `Updated employee ${updated.name}`,

      performedBy: performer.name,

      performedByRole: performer.role,
      metadata: {
        employeeName: updated.name,
        ...(statusChanged
          ? {
              previousStatus: previousEmployee?.status,
              newStatus: updated.status,
            }
          : {}),
      },
    });

    // Notification
    await addNotification(
      statusChanged
        ? "Employee Status Changed"
        : "Employee Updated",

      statusChanged
        ? `${updated.name}'s status changed to ${updated.status}.`
        : `${updated.name}'s employee record was updated.`,

      statusChanged
        ? "warning"
        : "info",

      `/employees/${updated.id}`
    );
  }

  // --------------------------------------------------
  // Delete Employee
  // --------------------------------------------------

  async function removeEmployee(
    id: string
  ) {
    if (!user || !hasPermission(user.role, "canDeleteEmployee")) {
      throw new AppError("FORBIDDEN", "Only administrators can delete employees.");
    }
    const employee =
      employees.find(
        (emp) => emp.id === id
      );

    await deleteEmployee(id);

    setEmployees((previous) =>
      previous.filter(
        (current) =>
          current.id !== id
      )
    );

    const performer =
      getPerformer();

    // Audit
    await addAuditLogSafely({
      action: "DELETE",
      entity: "Employee",
      entityId: id,

      description: employee
        ? `Deleted employee ${employee.name}`
        : `Deleted employee with ID ${id}`,

      performedBy: performer.name,

      performedByRole: performer.role,
      metadata: { employeeName: employee?.name },
    });

    // Notification
    await addNotification(
      "Employee Removed",

      employee
        ? `${employee.name} was removed from the employee directory.`
        : "An employee was removed from the directory.",

      "error"
    );
  }

  // --------------------------------------------------
  // Initial Load
  // --------------------------------------------------

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshEmployees().catch(() => undefined);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshEmployees]);

  // --------------------------------------------------
  // Statistics
  // --------------------------------------------------

  const stats =
    getEmployeeStats(employees);

  // --------------------------------------------------
  // Provider
  // --------------------------------------------------

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        loading,
        stats,
        refreshEmployees,
        createEmployee,
        editEmployee,
        removeEmployee,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
}

// --------------------------------------------------
// Hook
// --------------------------------------------------

export function useEmployeeContext() {
  const context =
    useContext(EmployeeContext);

  if (!context) {
    throw new Error(
      "useEmployeeContext must be used inside EmployeeProvider"
    );
  }

  return context;
}
