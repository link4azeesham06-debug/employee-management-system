import { z } from "zod";

import { LEAVE_STATUSES, LEAVE_TYPES } from "@/types/leave";

function isValidCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
  );
}

const leaveDateSchema = z
  .string()
  .trim()
  .min(1, "Date is required.")
  .refine(isValidCalendarDate, "Enter a valid date in YYYY-MM-DD format.");

export const leaveTypeSchema = z.enum(LEAVE_TYPES, {
  error: "Select a valid leave type.",
});

export const leaveStatusSchema = z.enum(LEAVE_STATUSES, {
  error: "Select a valid leave status.",
});

export const leaveRequestCreateSchema = z
  .object({
    leaveType: leaveTypeSchema,
    startDate: leaveDateSchema,
    endDate: leaveDateSchema,
    reason: z
      .string()
      .trim()
      .min(5, "Reason must contain at least 5 characters.")
      .max(500, "Reason must be 500 characters or fewer."),
  })
  .superRefine((request, context) => {
    if (
      isValidCalendarDate(request.startDate)
      && isValidCalendarDate(request.endDate)
      && request.endDate < request.startDate
    ) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date must be on or after the start date.",
      });
    }
  });

export const leaveDecisionSchema = z.object({
  id: z.string().trim().uuid("Leave request ID must be a valid UUID."),
  status: z.enum(["Approved", "Rejected"], {
    error: "Select a valid leave decision.",
  }),
});

export type LeaveRequestCreateInput = z.output<typeof leaveRequestCreateSchema>;
export type LeaveDecisionInput = z.output<typeof leaveDecisionSchema>;
