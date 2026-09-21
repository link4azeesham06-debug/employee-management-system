"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Department } from "@/types/department";
import type { DepartmentCreateInput } from "@/lib/validation/department";
import { AppError } from "@/lib/errors/AppError";
import { normalizeError } from "@/lib/errors/normalizeError";
import { reportError } from "@/lib/errors/reportError";

import {
  addDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment,
} from "@/services/departmentApi";
import { useAudit } from "@/context/AuditContext";
import { useNotifications } from "@/context/NotificationContext";
import { useAuth } from "@/hooks/useAuth";

type DepartmentContextType = {
  departments: Department[];
  loading: boolean;

  totalDepartments: number;
  activeDepartments: number;
  inactiveDepartments: number;

  refreshDepartments: () => Promise<void>;

  createDepartment: (
    department: DepartmentCreateInput
  ) => Promise<void>;

  editDepartment: (
    department: Department
  ) => Promise<void>;

  removeDepartment: (
    id: string
  ) => Promise<void>;
};

const DepartmentContext =
  createContext<DepartmentContextType | null>(
    null
  );

export function DepartmentProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [departments, setDepartments] =
    useState<Department[]>([]);

  const [loading, setLoading] =
    useState(true);
  const { user } = useAuth();
  const { addLog } = useAudit();
  const { addNotification } = useNotifications();

  function requireAdmin() {
    if (user?.role !== "admin") {
      throw new AppError("FORBIDDEN", "Only administrators can manage departments.");
    }
  }

  function performer() {
    return user?.employee?.name ?? user?.email ?? "System Admin";
  }

  async function addAuditLogSafely(
    input: Parameters<typeof addLog>[0],
  ): Promise<void> {
    try {
      await addLog(input);
    } catch (error) {
      reportError(error, { scope: "DepartmentContext.audit" });
    }
  }

  function ensureUniqueDepartment(
    department: DepartmentCreateInput | Department,
  ) {
    const duplicate = departments.some(
      (current) =>
        (current.name.toLowerCase() === department.name.toLowerCase() ||
          current.code.toLowerCase() === department.code.toLowerCase()) &&
        (!("id" in department) || current.id !== department.id),
    );

    if (duplicate) {
      throw new AppError("CONFLICT", "A department with this name or code already exists.", {
        metadata: { domain: "department" },
      });
    }
  }

  const refreshDepartments = useCallback(async () => {
    try {
      setLoading(true);

      if (!user) {
        setDepartments([]);
        return;
      }

      const data =
        await getDepartments();

      setDepartments(data);
    } catch (error) {
      setDepartments([]);
      const normalized = normalizeError(error, {
        fallbackCode: "DATABASE",
        fallbackMessage: "Unable to load departments.",
      });
      reportError(normalized, { scope: "DepartmentContext.refreshDepartments" });
      throw normalized;
    } finally {
      setLoading(false);
    }
  }, [user]);

  async function createDepartment(
    department: DepartmentCreateInput
  ) {
    requireAdmin();
    ensureUniqueDepartment(department);
    const created =
      await addDepartment(department);

    setDepartments((previous) => [
      ...previous,
      created,
    ]);
    await addAuditLogSafely({
      action: "CREATE",
      entity: "Department",
      entityId: created.id,
      description: `Created department ${created.name}`,
      performedBy: performer(),
      performedByRole: "admin",
      metadata: { departmentName: created.name },
    });
    await addNotification(
      "Department Added",
      `${created.name} was created.`,
      "success",
      "/departments",
    );
  }

  async function editDepartment(
    department: Department
  ) {
    requireAdmin();
    ensureUniqueDepartment(department);
    const updated =
      await updateDepartment(
        department
      );

    setDepartments((previous) =>
      previous.map((item) =>
        item.id === updated.id
          ? updated
          : item
      )
    );
    await addAuditLogSafely({
      action: "UPDATE",
      entity: "Department",
      entityId: updated.id,
      description: `Updated department ${updated.name}`,
      performedBy: performer(),
      performedByRole: "admin",
      metadata: { departmentName: updated.name },
    });
    await addNotification(
      "Department Updated",
      `${updated.name} was updated.`,
      "info",
      "/departments",
    );
  }

  async function removeDepartment(
    id: string
  ) {
    requireAdmin();
    const department = departments.find((item) => item.id === id);
    await deleteDepartment(id);

    setDepartments((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
    );
    await addAuditLogSafely({
      action: "DELETE",
      entity: "Department",
      entityId: id,
      description: department
        ? `Deleted department ${department.name}`
        : `Deleted department with ID ${id}`,
      performedBy: performer(),
      performedByRole: "admin",
      metadata: { departmentName: department?.name },
    });
    await addNotification(
      "Department Removed",
      department
        ? `${department.name} was removed.`
        : "A department was removed.",
      "warning",
      "/departments",
    );
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshDepartments().catch(() => undefined);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshDepartments]);

  const stats = useMemo(() => {
    const totalDepartments =
      departments.length;

    const activeDepartments =
      departments.filter(
        (department) =>
          department.status === "Active"
      ).length;

    const inactiveDepartments =
      departments.filter(
        (department) =>
          department.status === "Inactive"
      ).length;

    return {
      totalDepartments,
      activeDepartments,
      inactiveDepartments,
    };
  }, [departments]);

  return (
    <DepartmentContext.Provider
      value={{
        departments,
        loading,

        totalDepartments:
          stats.totalDepartments,

        activeDepartments:
          stats.activeDepartments,

        inactiveDepartments:
          stats.inactiveDepartments,

        refreshDepartments,

        createDepartment,

        editDepartment,

        removeDepartment,
      }}
    >
      {children}
    </DepartmentContext.Provider>
  );
}

export function useDepartmentContext() {
  const context =
    useContext(
      DepartmentContext
    );

  if (!context) {
    throw new Error(
      "useDepartmentContext must be used inside DepartmentProvider"
    );
  }

  return context;
}
