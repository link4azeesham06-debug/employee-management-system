import { z } from "zod";

export const employeeStatusSchema = z.enum(
  ["Active", "On Leave", "Inactive"],
  { error: "Select a valid employment status." },
);

function isValidCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

const employeeFields = {
  employeeId: z.string().trim().min(1, "Employee ID is required.").max(32, "Employee ID must be 32 characters or fewer."),
  name: z.string().trim().min(2, "Name must contain at least 2 characters.").max(100, "Name must be 100 characters or fewer."),
  email: z.string().trim().toLowerCase().pipe(z.email({ error: "Enter a valid email address." })),
  position: z.string().trim().min(1, "Position is required.").max(100, "Position must be 100 characters or fewer."),
  department: z.string().trim().min(1, "Department is required.").max(100, "Department must be 100 characters or fewer."),
  status: employeeStatusSchema,
  joinedDate: z.string().trim().min(1, "Joined date is required.").refine(isValidCalendarDate, "Enter a valid date in YYYY-MM-DD format."),
};

export const employeeCreateSchema = z.object(employeeFields);

export const employeeUpdateSchema = employeeCreateSchema.extend({
  id: z.string().trim().uuid("Employee record ID must be a valid UUID."),
});

export type EmployeeCreateInput = z.output<typeof employeeCreateSchema>;
export type EmployeeUpdateInput = z.output<typeof employeeUpdateSchema>;
