export const LEAVE_TYPES = ["Annual", "Sick", "Personal", "Unpaid"] as const;

export const LEAVE_STATUSES = ["Pending", "Approved", "Rejected"] as const;

export type LeaveType = (typeof LEAVE_TYPES)[number];
export type LeaveStatus = (typeof LEAVE_STATUSES)[number];
export type LeaveDecision = Exclude<LeaveStatus, "Pending">;

export type LeaveRequest = {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
};
