export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "EXPORT"
  | "STATUS_CHANGE";

export type AuditEntity =
  | "Employee"
  | "Department"
  | "User"
  | "Report"
  | "System";

export type AuditLog = {
  id: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  description: string;
  performedBy: string;
  performedByRole: "admin" | "employee";
  createdAt: string;
};