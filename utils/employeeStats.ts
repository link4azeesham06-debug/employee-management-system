import { Employee } from "@/types/employee";

export type EmployeeStats = {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  onLeaveEmployees: number;
  totalDepartments: number;
  totalPositions: number;
};

export function getEmployeeStats(
  employees: Employee[]
): EmployeeStats {

  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    employee => employee.status === "Active"
  ).length;

  const inactiveEmployees = employees.filter(
    employee => employee.status === "Inactive"
  ).length;

  const onLeaveEmployees = employees.filter(
    employee => employee.status === "On Leave"
  ).length;

  const totalDepartments = new Set(
    employees.map(
      employee => employee.department
    )
  ).size;

  const totalPositions = new Set(
    employees.map(
      employee => employee.position
    )
  ).size;

  return {

    totalEmployees,

    activeEmployees,

    inactiveEmployees,

    onLeaveEmployees,

    totalDepartments,

    totalPositions,

  };

}