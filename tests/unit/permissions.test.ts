import { describe, expect, it } from "vitest";

import { hasPermission, permissions } from "@/utils/permissions";

describe("role permissions", () => {
  it("allows administrators to perform every defined management action", () => {
    for (const permission of Object.keys(permissions.admin) as Array<keyof typeof permissions.admin>) {
      expect(hasPermission("admin", permission), permission).toBe(true);
    }
  });

  it("denies employees every administrator management action", () => {
    for (const permission of Object.keys(permissions.admin) as Array<keyof typeof permissions.admin>) {
      expect(hasPermission("employee", permission), permission).toBe(false);
    }
  });
});
