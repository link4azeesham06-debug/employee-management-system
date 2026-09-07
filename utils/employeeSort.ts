import { Employee } from "@/types/employee";

export type SortDirection = "asc" | "desc";

export function sortEmployees(
  employees: Employee[],
  sortColumn: keyof Employee,
  sortDirection: SortDirection
): Employee[] {

  return [...employees].sort((a, b) => {

    const first = a[sortColumn];
    const second = b[sortColumn];

    if (first < second) {
      return sortDirection === "asc" ? -1 : 1;
    }

    if (first > second) {
      return sortDirection === "asc" ? 1 : -1;
    }

    return 0;

  });

}