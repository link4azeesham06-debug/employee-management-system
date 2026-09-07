import { Employee } from "@/types/employee";

export function exportEmployeesToCSV(
  employees: Employee[]
) {
  if (!employees.length) {
    return;
  }

  const headers = [
    "Employee ID",
    "Name",
    "Email",
    "Position",
    "Department",
    "Status",
    "Joined Date",
  ];

  const rows = employees.map((employee) => [
    employee.employeeId,
    employee.name,
    employee.email,
    employee.position,
    employee.department,
    employee.status,
    employee.joinedDate,
  ]);

  const csvContent = [
    headers,
    ...rows,
  ]
    .map((row) =>
      row
        .map((value) =>
          `"${String(value ?? "").replace(/"/g, '""')}"`
        )
        .join(",")
    )
    .join("\n");

  const blob = new Blob(
    [csvContent],
    {
      type: "text/csv;charset=utf-8;",
    }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = `employees-${new Date()
    .toISOString()
    .split("T")[0]}.csv`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}