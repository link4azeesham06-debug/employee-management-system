"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarCheck2,
  Check,
  Clock3,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import LeaveRequestForm from "@/components/leave/LeaveRequestForm";
import { useAudit } from "@/context/AuditContext";
import { useAuth } from "@/hooks/useAuth";
import { useEmployees } from "@/hooks/useEmployees";
import { usePermissions } from "@/hooks/usePermissions";
import { getUserErrorMessage } from "@/lib/errors/normalizeError";
import { reportError } from "@/lib/errors/reportError";
import type { LeaveRequestCreateInput } from "@/lib/validation/leave";
import {
  approveLeaveRequest,
  createLeaveRequest,
  getAllLeaveRequests,
  getCurrentEmployeeLeaveRequests,
  rejectLeaveRequest,
} from "@/services/leaveService";
import type { Employee } from "@/types/employee";
import type { LeaveDecision, LeaveRequest, LeaveStatus } from "@/types/leave";

export default function LeavePage() {
  return (
    <ProtectedRoute>
      <LeaveContent />
    </ProtectedRoute>
  );
}

function LeaveContent() {
  const { user } = useAuth();
  const { employees } = useEmployees();
  const { canApproveLeaves, canRequestLeave } = usePermissions();
  const { addLog } = useAudit();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const employeeById = useMemo(
    () => new Map(employees.map((employee) => [employee.id, employee])),
    [employees],
  );

  const refreshRequests = useCallback(async () => {
    if (!user) {
      setRequests([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = user.role === "admin"
        ? await getAllLeaveRequests()
        : await getCurrentEmployeeLeaveRequests();
      setRequests(data);
    } catch (requestError) {
      const message = getUserErrorMessage(requestError, "Unable to load leave requests.");
      setError(message);
      reportError(requestError, { scope: "LeavePage.refresh", route: "/leave" });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshRequests();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshRequests]);

  const counts = useMemo(() => ({
    pending: requests.filter((request) => request.status === "Pending").length,
    approved: requests.filter((request) => request.status === "Approved").length,
    rejected: requests.filter((request) => request.status === "Rejected").length,
  }), [requests]);

  function performerName(): string {
    return user?.employee?.name ?? user?.email ?? "System User";
  }

  async function recordAudit(
    request: LeaveRequest,
    action: "CREATE",
    description: string,
  ) {
    if (!user) return;

    try {
      await addLog({
        action,
        entity: "Leave Request",
        entityId: request.id,
        description,
        performedBy: performerName(),
        performedByRole: user.role,
        metadata: {
          employeeId: request.employeeId,
          leaveType: request.leaveType,
          status: request.status,
        },
      });
    } catch (auditError) {
      reportError(auditError, { scope: "LeavePage.audit", route: "/leave" });
    }
  }

  async function handleSubmit(input: LeaveRequestCreateInput) {
    try {
      const created = await createLeaveRequest(input);
      setRequests((current) => [created, ...current]);
      setFormOpen(false);

      const employeeName = user?.employee?.name ?? "Employee";
      await recordAudit(
        created,
        "CREATE",
        `${employeeName} submitted an ${created.leaveType} leave request.`,
      );
      toast.success("Leave request submitted");
    } catch (requestError) {
      toast.error(getUserErrorMessage(requestError, "Unable to submit leave request."));
      throw requestError;
    }
  }

  async function handleDecision(request: LeaveRequest, decision: LeaveDecision) {
    if (!window.confirm(`${decision === "Approved" ? "Approve" : "Reject"} this leave request?`)) {
      return;
    }

    try {
      setReviewingId(request.id);
      setError(null);
      if (decision === "Approved") {
        await approveLeaveRequest(request.id);
      } else {
        await rejectLeaveRequest(request.id);
      }
      await refreshRequests();
      toast.success(`Leave request ${decision.toLowerCase()}`);
    } catch (requestError) {
      reportError(requestError, {
        scope: "LeavePage.review",
        route: "/leave",
        operation: "review",
        entityType: "Leave Request",
        entityId: request.id,
      });
      const message = getUserErrorMessage(requestError, "Unable to review leave request.");
      setError(message);
      toast.error(message);
    } finally {
      setReviewingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
            Time away
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Leave Management
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {user?.role === "admin"
              ? "Review employee leave requests and record clear decisions."
              : "Submit leave requests and follow their review status."}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void refreshRequests()}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} aria-hidden="true" />
            Refresh
          </button>
          {canRequestLeave && (
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              <Plus size={18} aria-hidden="true" />
              Request leave
            </button>
          )}
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2 sm:gap-3" aria-label="Leave request summary">
        <SummaryCard label="Pending" value={counts.pending} icon={<Clock3 size={18} />} tone="amber" />
        <SummaryCard label="Approved" value={counts.approved} icon={<Check size={18} />} tone="emerald" />
        <SummaryCard label="Rejected" value={counts.rejected} icon={<X size={18} />} tone="red" />
      </section>

      {error && (
        <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => void refreshRequests()} className="inline-flex min-h-10 items-center justify-center self-start rounded-lg px-3 font-semibold underline underline-offset-2 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 sm:self-auto">
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <LeaveLoadingSkeleton />
      ) : requests.length === 0 ? (
        <LeaveEmptyState canRequest={canRequestLeave} onRequest={() => setFormOpen(true)} />
      ) : (
        <LeaveDirectory
          requests={requests}
          employeeById={employeeById}
          isAdmin={user?.role === "admin"}
          canApprove={canApproveLeaves}
          reviewingId={reviewingId}
          onDecision={handleDecision}
        />
      )}

      {formOpen && <LeaveRequestForm onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />}
    </div>
  );
}

function LeaveDirectory({
  requests,
  employeeById,
  isAdmin,
  canApprove,
  reviewingId,
  onDecision,
}: {
  requests: LeaveRequest[];
  employeeById: Map<string, Employee>;
  isAdmin: boolean;
  canApprove: boolean;
  reviewingId: string | null;
  onDecision: (request: LeaveRequest, decision: LeaveDecision) => Promise<void>;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-bold text-slate-950">Leave requests</h2>
        <p className="mt-1 text-sm text-slate-500">{requests.length} request{requests.length === 1 ? "" : "s"}</p>
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              {isAdmin && <th scope="col" className="px-5 py-3.5">Employee</th>}
              <th scope="col" className="px-5 py-3.5">Leave</th>
              <th scope="col" className="px-5 py-3.5">Dates</th>
              <th scope="col" className="px-5 py-3.5">Reason</th>
              <th scope="col" className="px-5 py-3.5">Status</th>
              <th scope="col" className="px-5 py-3.5">Submitted</th>
              {isAdmin && <th scope="col" className="px-5 py-3.5 text-right">Decision</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((request) => {
              const employee = employeeById.get(request.employeeId);
              return (
                <tr key={request.id} className="align-top transition hover:bg-slate-50/60">
                  {isAdmin && <td className="px-5 py-4"><EmployeeIdentity employee={employee} /></td>}
                  <td className="px-5 py-4 font-semibold text-slate-800">{request.leaveType}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDate(request.startDate)} – {formatDate(request.endDate)}</td>
                  <td className="max-w-xs px-5 py-4 leading-5 text-slate-600">{request.reason}</td>
                  <td className="px-5 py-4"><LeaveStatusBadge status={request.status} /></td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-500">{formatDate(request.createdAt)}</td>
                  {isAdmin && (
                    <td className="px-5 py-4">
                      <DecisionControls request={request} enabled={canApprove} busy={reviewingId === request.id} onDecision={onDecision} />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 lg:hidden">
        {requests.map((request) => {
          const employee = employeeById.get(request.employeeId);
          return (
            <article key={request.id} className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  {isAdmin && <EmployeeIdentity employee={employee} />}
                  <p className={`${isAdmin ? "mt-3" : ""} font-bold text-slate-950`}>{request.leaveType} leave</p>
                  <p className="mt-1 text-sm text-slate-500">{formatDate(request.startDate)} – {formatDate(request.endDate)}</p>
                </div>
                <LeaveStatusBadge status={request.status} />
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{request.reason}</p>
              <p className="mt-3 text-xs text-slate-400">Submitted {formatDate(request.createdAt)}</p>
              {isAdmin && <div className="mt-4"><DecisionControls request={request} enabled={canApprove} busy={reviewingId === request.id} onDecision={onDecision} /></div>}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function DecisionControls({
  request,
  enabled,
  busy,
  onDecision,
}: {
  request: LeaveRequest;
  enabled: boolean;
  busy: boolean;
  onDecision: (request: LeaveRequest, decision: LeaveDecision) => Promise<void>;
}) {
  if (request.status !== "Pending" || !enabled) return <span className="text-xs text-slate-400">Reviewed</span>;

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <button type="button" onClick={() => void onDecision(request, "Approved")} disabled={busy} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 sm:h-9">
        <Check size={14} aria-hidden="true" />Approve
      </button>
      <button type="button" onClick={() => void onDecision(request, "Rejected")} disabled={busy} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-red-50 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 sm:h-9">
        <X size={14} aria-hidden="true" />Reject
      </button>
    </div>
  );
}

function EmployeeIdentity({ employee }: { employee?: Employee }) {
  return (
    <div>
      <p className="font-semibold text-slate-900">{employee?.name ?? "Employee unavailable"}</p>
      <p className="mt-0.5 text-xs text-slate-500">{employee?.employeeId ?? "—"} · {employee?.department ?? "—"}</p>
    </div>
  );
}

function LeaveStatusBadge({ status }: { status: LeaveStatus }) {
  const classes: Record<LeaveStatus, string> = {
    Pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
    Approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    Rejected: "bg-red-50 text-red-700 ring-red-600/20",
  };

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${classes[status]}`}>{status}</span>;
}

function SummaryCard({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: "amber" | "emerald" | "red" }) {
  const tones = {
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
  };
  return <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-slate-500 sm:text-sm">{label}</p><p className="mt-1.5 text-xl font-bold text-slate-950 sm:text-3xl">{value}</p></div><span className={`hidden h-10 w-10 items-center justify-center rounded-xl sm:flex ${tones[tone]}`} aria-hidden="true">{icon}</span></div></article>;
}

function LeaveEmptyState({ canRequest, onRequest }: { canRequest: boolean; onRequest: () => void }) {
  return <section className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><CalendarCheck2 size={26} aria-hidden="true" /></span><h2 className="mt-5 text-lg font-bold text-slate-950">No leave requests yet</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{canRequest ? "Submit your first leave request when you need time away." : "Employee leave requests will appear here for review."}</p>{canRequest && <button type="button" onClick={onRequest} className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><Plus size={17} aria-hidden="true" />Request leave</button>}</section>;
}

function LeaveLoadingSkeleton() {
  return <section className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" role="status" aria-label="Loading leave requests"><div className="border-b border-slate-100 p-5"><div className="h-5 w-36 rounded bg-slate-200" /><div className="mt-2 h-3 w-20 rounded bg-slate-100" /></div>{Array.from({ length: 4 }, (_, index) => <div key={index} className="flex gap-4 border-b border-slate-100 p-5"><div className="h-10 w-10 rounded-xl bg-slate-200" /><div className="flex-1 space-y-2"><div className="h-4 w-40 rounded bg-slate-200" /><div className="h-3 w-2/3 rounded bg-slate-100" /></div></div>)}<span className="sr-only">Loading leave requests</span></section>;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
