export type DepartmentStatus =
  | "Active"
  | "Inactive";

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  manager: string;
  status: DepartmentStatus;
  employeeCount: number;
  createdAt: string;
}