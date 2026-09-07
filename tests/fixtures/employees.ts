import type { Employee } from "@/types/employee";

export const employees: Employee[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    employeeId: "EMP-001",
    name: "Ada Lovelace",
    email: "ada@example.com",
    position: "Engineer",
    department: "Engineering",
    status: "Active",
    joinedDate: "2025-01-15",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    employeeId: "EMP-002",
    name: "Grace Hopper",
    email: "grace@example.com",
    position: "Director",
    department: "Engineering",
    status: "On Leave",
    joinedDate: "2025-03-01",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    employeeId: "EMP-003",
    name: "Katherine Johnson",
    email: "katherine@example.com",
    position: "Analyst",
    department: "Finance",
    status: "Inactive",
    joinedDate: "2025-03-20",
  },
];
