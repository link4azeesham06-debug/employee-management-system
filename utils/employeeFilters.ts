import { Employee } from "@/types/employee";

type FilterOptions = {
  search: string;
  department: string;
  status: string;
};

export function filterEmployees(
  employees: Employee[],
  filters: FilterOptions
): Employee[] {

  const query = filters.search.toLowerCase();

  return employees.filter((employee) => {

    const matchesSearch =
      employee.name.toLowerCase().includes(query) ||
      employee.email.toLowerCase().includes(query) ||
      employee.employeeId.toLowerCase().includes(query) ||
      employee.department.toLowerCase().includes(query) ||
      employee.position.toLowerCase().includes(query) ||
      employee.status.toLowerCase().includes(query);

    const matchesDepartment =
      filters.department === "All" ||
      employee.department === filters.department;

    const matchesStatus =
      filters.status === "All" ||
      employee.status === filters.status;

    return (
      matchesSearch &&
      matchesDepartment &&
      matchesStatus
    );

  });

}