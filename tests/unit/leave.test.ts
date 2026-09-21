import { describe, expect, it } from "vitest";

import {
  leaveDecisionSchema,
  leaveRequestCreateSchema,
  leaveStatusSchema,
} from "@/lib/validation/leave";
import { assertLeaveTransition, canReviewLeaveRequest } from "@/utils/leaveWorkflow";

const validRequest = {
  leaveType: "Annual" as const,
  startDate: "2026-10-12",
  endDate: "2026-10-16",
  reason: "Family travel plans",
};

describe("leave request validation", () => {
  it("accepts a valid leave request", () => {
    expect(leaveRequestCreateSchema.safeParse(validRequest).success).toBe(true);
  });

  it.each([
    ["malformed start date", { startDate: "2026-02-30" }],
    ["malformed end date", { endDate: "not-a-date" }],
    ["end date before start date", { startDate: "2026-10-20", endDate: "2026-10-19" }],
  ])("rejects %s", (_label, change) => {
    expect(leaveRequestCreateSchema.safeParse({ ...validRequest, ...change }).success).toBe(false);
  });

  it("rejects an unsupported leave type", () => {
    expect(leaveRequestCreateSchema.safeParse({
      ...validRequest,
      leaveType: "Bereavement",
    }).success).toBe(false);
  });

  it("rejects an unsupported status or decision", () => {
    expect(leaveStatusSchema.safeParse("Cancelled").success).toBe(false);
    expect(leaveDecisionSchema.safeParse({
      id: "11111111-1111-4111-8111-111111111111",
      status: "Pending",
    }).success).toBe(false);
  });
});

describe("leave workflow transitions", () => {
  it("allows Pending to Approved", () => {
    expect(canReviewLeaveRequest("Pending", "Approved")).toBe(true);
    expect(() => assertLeaveTransition("Pending", "Approved")).not.toThrow();
  });

  it("allows Pending to Rejected", () => {
    expect(canReviewLeaveRequest("Pending", "Rejected")).toBe(true);
    expect(() => assertLeaveTransition("Pending", "Rejected")).not.toThrow();
  });

  it("blocks Approved to Rejected", () => {
    expect(() => assertLeaveTransition("Approved", "Rejected")).toThrowError(
      "Only pending leave requests can be reviewed.",
    );
  });

  it("blocks Rejected to Approved", () => {
    expect(() => assertLeaveTransition("Rejected", "Approved")).toThrowError(
      "Only pending leave requests can be reviewed.",
    );
  });
});
