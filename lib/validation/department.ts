import { z } from "zod";

export const departmentStatusSchema = z.enum(["Active", "Inactive"], {
  error: "Select a valid department status.",
});

const optionalText = (maximum: number, message: string) =>
  z.preprocess(
    (value) => value ?? "",
    z.string().trim().max(maximum, message),
  );

const departmentFields = {
  name: z.string().trim().min(1, "Department name is required.").max(100, "Department name must be 100 characters or fewer."),
  code: z.string().trim().toUpperCase().min(1, "Department code is required.").max(16, "Department code must be 16 characters or fewer."),
  description: optionalText(500, "Description must be 500 characters or fewer."),
  manager: optionalText(100, "Manager name must be 100 characters or fewer."),
  status: departmentStatusSchema,
};

export const departmentCreateSchema = z.object(departmentFields);

export const departmentUpdateSchema = departmentCreateSchema.extend({
  id: z.string().trim().uuid("Department record ID must be a valid UUID."),
});

export type DepartmentCreateInput = z.output<typeof departmentCreateSchema>;
export type DepartmentUpdateInput = z.output<typeof departmentUpdateSchema>;
