import { AppError } from "@/lib/errors/AppError";
import type { LeaveDecision, LeaveStatus } from "@/types/leave";

export function canReviewLeaveRequest(
  currentStatus: LeaveStatus,
  decision: LeaveDecision,
): boolean {
  return currentStatus === "Pending"
    && (decision === "Approved" || decision === "Rejected");
}

export function assertLeaveTransition(
  currentStatus: LeaveStatus,
  decision: LeaveDecision,
): void {
  if (!canReviewLeaveRequest(currentStatus, decision)) {
    throw new AppError(
      "CONFLICT",
      "Only pending leave requests can be reviewed.",
      {
        metadata: {
          domain: "leave",
          currentStatus,
          attemptedStatus: decision,
        },
      },
    );
  }
}
