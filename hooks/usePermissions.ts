"use client";

import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/utils/permissions";
export function usePermissions() {

  const { user } = useAuth();

  const role = user?.role ?? "employee";

  const employeeEmail =
    user?.email ?? "";

  const employeeRecordId =
    user?.role === "employee"
      ? user.employee?.id ?? user.id
      : "";

  return {
    role,
    employeeEmail,
    employeeRecordId,
    canCreateEmployee: hasPermission(
      role,
      "canCreateEmployee"
    ),

    canEditEmployee: hasPermission(
      role,
      "canEditEmployee"
    ),

    canDeleteEmployee: hasPermission(
      role,
      "canDeleteEmployee"
    ),

    canViewReports: hasPermission(
      role,
      "canViewReports"
    ),

    canManageDepartments: hasPermission(
      role,
      "canManageDepartments"
    ),

    canApproveLeaves: hasPermission(
      role,
      "canApproveLeaves"
    ),

    canManageUsers: hasPermission(
      role,
      "canManageUsers"
    ),

  };

}
