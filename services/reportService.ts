import { Employee } from "@/types/employee";
import {
  DepartmentReport,
  EmployeeStatus,
  EmployeeStatusReport,
  HiringTrend,
  HRReport,
  WorkforceSummary,
} from "@/types/report";

function getMonthKey(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return `${parsedDate.getFullYear()}-${String(
    parsedDate.getMonth() + 1
  ).padStart(2, "0")}`;
}

function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split("-");

  if (!year || !month) {
    return monthKey;
  }

  return new Date(
    Number(year),
    Number(month) - 1,
    1
  ).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function calculateSummary(
  employees: Employee[]
): WorkforceSummary {
  const departments = new Set(
    employees.map((employee) => employee.department)
  );

  const positions = new Set(
    employees.map((employee) => employee.position)
  );

  return {
    totalEmployees: employees.length,

    activeEmployees: employees.filter(
      (employee) => employee.status === "Active"
    ).length,

    employeesOnLeave: employees.filter(
      (employee) => employee.status === "On Leave"
    ).length,

    inactiveEmployees: employees.filter(
      (employee) => employee.status === "Inactive"
    ).length,

    totalDepartments: departments.size,

    totalPositions: positions.size,
  };
}

function calculateDepartments(
  employees: Employee[]
): DepartmentReport[] {
  const departmentMap = new Map<
    string,
    DepartmentReport
  >();

  employees.forEach((employee) => {
    const department = employee.department;

    if (!departmentMap.has(department)) {
      departmentMap.set(department, {
        department,
        total: 0,
        active: 0,
        onLeave: 0,
        inactive: 0,
      });
    }

    const report =
      departmentMap.get(department)!;

    report.total += 1;

    if (employee.status === "Active") {
      report.active += 1;
    }

    if (employee.status === "On Leave") {
      report.onLeave += 1;
    }

    if (employee.status === "Inactive") {
      report.inactive += 1;
    }
  });

  return Array.from(
    departmentMap.values()
  ).sort(
    (a, b) => b.total - a.total
  );
}

function calculateStatuses(
  employees: Employee[]
): EmployeeStatusReport[] {
  const statuses: EmployeeStatus[] = [
    "Active",
    "On Leave",
    "Inactive",
  ];

  const totalEmployees = employees.length;

  return statuses.map((status) => {
    const count = employees.filter(
      (employee) =>
        employee.status === status
    ).length;

    const percentage =
      totalEmployees === 0
        ? 0
        : Number(
            ((count / totalEmployees) * 100).toFixed(
              1
            )
          );

    return {
      status,
      count,
      percentage,
    };
  });
}

function calculateHiringTrend(
  employees: Employee[]
): HiringTrend[] {
  const monthMap = new Map<
    string,
    number
  >();

  employees.forEach((employee) => {
    const month = getMonthKey(
      employee.joinedDate
    );

    if (!month) {
      return;
    }

    monthMap.set(
      month,
      (monthMap.get(month) ?? 0) + 1
    );
  });

  return Array.from(
    monthMap.entries()
  )
    .sort(([a], [b]) =>
      a.localeCompare(b)
    )
    .map(([month, hires]) => ({
      month: formatMonth(month),
      hires,
    }));
}

export function generateHRReport(
  employees: Employee[]
): HRReport {
  return {
    summary:
      calculateSummary(employees),

    departments:
      calculateDepartments(employees),

    statuses:
      calculateStatuses(employees),

    hiringTrend:
      calculateHiringTrend(employees),
  };
}