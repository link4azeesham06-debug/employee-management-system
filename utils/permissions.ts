export type UserRole =
  | "admin"
  | "employee";

export const permissions = {

  admin: {

    canCreateEmployee: true,

    canEditEmployee: true,

    canDeleteEmployee: true,

    canViewReports: true,

    canManageDepartments: true,

    canApproveLeaves: true,

    canManageUsers: true,

  },

  employee: {

    canCreateEmployee: false,

    canEditEmployee: false,

    canDeleteEmployee: false,

    canViewReports: false,

    canManageDepartments: false,

    canApproveLeaves: false,

    canManageUsers: false,

  },

};

export function hasPermission(

  role: UserRole,

  permission: keyof typeof permissions.admin

) {

  return permissions[role][permission];

}