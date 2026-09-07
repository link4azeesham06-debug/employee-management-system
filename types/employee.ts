export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  position: string;
  department: string;
  status: "Active" | "On Leave" | "Inactive";
  joinedDate: string;
}