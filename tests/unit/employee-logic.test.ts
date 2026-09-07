import { describe, expect, it } from "vitest";

import { generateHRReport } from "@/services/reportService";
import { employees } from "@/tests/fixtures/employees";
import { filterEmployees } from "@/utils/employeeFilters";
import { sortEmployees } from "@/utils/employeeSort";
import { getEmployeeStats } from "@/utils/employeeStats";

describe("employee filtering", () => {
  it("searches by name and email", () => {
    expect(filterEmployees(employees, { search: "ada", department: "All", status: "All" })).toHaveLength(1);
    expect(filterEmployees(employees, { search: "grace@example", department: "All", status: "All" })).toHaveLength(1);
  });

  it("combines department and status filters", () => {
    const result = filterEmployees(employees, {
      search: "",
      department: "Engineering",
      status: "On Leave",
    });
    expect(result.map((employee) => employee.name)).toEqual(["Grace Hopper"]);
  });
});

describe("employee sorting", () => {
  it("sorts names ascending without mutating the source", () => {
    const source = [...employees].reverse();
    const result = sortEmployees(source, "name", "asc");
    expect(result.map((employee) => employee.name)).toEqual([
      "Ada Lovelace",
      "Grace Hopper",
      "Katherine Johnson",
    ]);
    expect(source[0].name).toBe("Katherine Johnson");
  });

  it("sorts ISO joined dates descending", () => {
    expect(sortEmployees(employees, "joinedDate", "desc").map((employee) => employee.employeeId)).toEqual([
      "EMP-003",
      "EMP-002",
      "EMP-001",
    ]);
  });
});

describe("employee statistics and reports", () => {
  it("calculates workforce counts", () => {
    expect(getEmployeeStats(employees)).toEqual({
      totalEmployees: 3,
      activeEmployees: 1,
      inactiveEmployees: 1,
      onLeaveEmployees: 1,
      totalDepartments: 2,
      totalPositions: 3,
    });
  });

  it("aggregates departments, statuses, and hiring trend", () => {
    const report = generateHRReport(employees);
    expect(report.summary).toMatchObject({ totalEmployees: 3, totalDepartments: 2 });
    expect(report.departments[0]).toMatchObject({ department: "Engineering", total: 2, active: 1, onLeave: 1 });
    expect(report.statuses.map(({ status, count }) => ({ status, count }))).toEqual([
      { status: "Active", count: 1 },
      { status: "On Leave", count: 1 },
      { status: "Inactive", count: 1 },
    ]);
    expect(report.hiringTrend).toEqual([
      { month: "Jan 2025", hires: 1 },
      { month: "Mar 2025", hires: 2 },
    ]);
  });
});
