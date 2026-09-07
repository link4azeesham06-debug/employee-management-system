export type EmployeeStatus =
  | "Active"
  | "On Leave"
  | "Inactive";

export type DepartmentReport = {
  department: string;
  total: number;
  active: number;
  onLeave: number;
  inactive: number;
};

export type EmployeeStatusReport = {
  status: EmployeeStatus;
  count: number;
  percentage: number;
};

export type HiringTrend = {
  month: string;
  hires: number;
};

export type WorkforceSummary = {
  totalEmployees: number;
  activeEmployees: number;
  employeesOnLeave: number;
  inactiveEmployees: number;
  totalDepartments: number;
  totalPositions: number;
};

export type HRReport = {
  summary: WorkforceSummary;
  departments: DepartmentReport[];
  statuses: EmployeeStatusReport[];
  hiringTrend: HiringTrend[];
};