import { describe, expect, it } from "vitest";

import { hasPermission, permissions } from "@/utils/permissions";

describe("role permissions", () => {
  it("allows administrators to perform management and leave-review actions", () => {
    const managementPermissions: Array<keyof typeof permissions.admin> = [
      "canCreateEmployee",
      "canEditEmployee",
      "canDeleteEmployee",
      "canViewReports",
      "canManageDepartments",
      "canApproveLeaves",
      "canManageUsers",
      "canViewLeave",
    ];

    for (const permission of managementPermissions) {
      expect(hasPermission("admin", permission), permission).toBe(true);
    }
  });

  it("denies employees administrator management actions", () => {
    const adminOnlyPermissions: Array<keyof typeof permissions.admin> = [
      "canCreateEmployee",
      "canEditEmployee",
      "canDeleteEmployee",
      "canViewReports",
      "canManageDepartments",
      "canApproveLeaves",
      "canManageUsers",
    ];

    for (const permission of adminOnlyPermissions) {
      expect(hasPermission("employee", permission), permission).toBe(false);
    }
  });

  it("allows employees to request leave but only admins to review it", () => {
    expect(hasPermission("employee", "canViewLeave")).toBe(true);
    expect(hasPermission("employee", "canRequestLeave")).toBe(true);
    expect(hasPermission("employee", "canApproveLeaves")).toBe(false);
    expect(hasPermission("admin", "canViewLeave")).toBe(true);
    expect(hasPermission("admin", "canRequestLeave")).toBe(false);
    expect(hasPermission("admin", "canApproveLeaves")).toBe(true);
  });
});
