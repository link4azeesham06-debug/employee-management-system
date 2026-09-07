"use client";

import { BellRing, CheckCheck, Database, RefreshCw, Settings, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

import RoleGuard from "@/components/auth/RoleGuard";
import { useDepartmentContext } from "@/context/DepartmentContext";
import { useNotifications } from "@/context/NotificationContext";
import { useEmployees } from "@/hooks/useEmployees";
import { getUserErrorMessage } from "@/lib/errors/normalizeError";

export default function SettingsPage() {
  return <RoleGuard allowedRoles={["admin"]}><SettingsContent /></RoleGuard>;
}

function SettingsContent() {
  const { refreshEmployees, loading: employeesLoading } = useEmployees();
  const { refreshDepartments, loading: departmentsLoading } = useDepartmentContext();
  const { unreadCount, markAllAsRead } = useNotifications();
  const refreshing = employeesLoading || departmentsLoading;

  async function refreshApplicationData() {
    try {
      await Promise.all([refreshEmployees(), refreshDepartments()]);
      toast.success("Application data refreshed");
    } catch (error) {
      toast.error(getUserErrorMessage(error, "Failed to refresh application data"));
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">Administration</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Settings</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Manage the application maintenance controls currently available to HR administrators.</p>
        </div>
        <span className="inline-flex h-10 w-fit items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 text-sm font-semibold text-indigo-700"><ShieldCheck size={16} aria-hidden="true" />Administrator access</span>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="settings-overview-heading">
        <div className="flex items-start gap-3 px-5 py-4 sm:px-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Settings size={19} aria-hidden="true" /></span>
          <div><h2 id="settings-overview-heading" className="text-base font-bold text-slate-950">Administrative controls</h2><p className="mt-1 text-sm leading-5 text-slate-500">These actions use the application&apos;s existing data providers and affect your current authenticated workspace.</p></div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <SettingsSection icon={<Database size={19} />} title="Data synchronization" description="Refresh workforce and organizational information from the connected providers.">
          <ControlRow
            title="Refresh application data"
            description="Reload employee and department records without changing or deleting stored information."
            status={refreshing ? "Refresh in progress" : "Ready to refresh"}
            active={refreshing}
          >
            <button type="button" onClick={refreshApplicationData} disabled={refreshing} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:w-auto" aria-label={refreshing ? "Refreshing application data" : "Refresh employee and department data"}>
              <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} aria-hidden="true" />
              {refreshing ? "Refreshing data" : "Refresh data"}
            </button>
          </ControlRow>
        </SettingsSection>

        <SettingsSection icon={<BellRing size={19} />} title="Notification maintenance" description="Manage the read state of notifications associated with your account.">
          <ControlRow
            title="Mark all notifications as read"
            description="Clear the unread state from every notification currently in your inbox."
            status={unreadCount ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}` : "No unread notifications"}
            active={unreadCount > 0}
          >
            <button type="button" onClick={markAllAsRead} disabled={unreadCount === 0} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:w-auto" aria-label={unreadCount ? `Mark all ${unreadCount} unread notifications as read` : "No unread notifications to mark as read"}>
              <CheckCheck size={17} aria-hidden="true" />Mark all read
            </button>
          </ControlRow>
        </SettingsSection>
      </div>

    </div>
  );
}

function SettingsSection({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return <section className="flex min-h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><header className="flex items-start gap-3 border-b border-slate-200 px-5 py-4 sm:px-6"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600" aria-hidden="true">{icon}</span><div><h2 className="text-base font-bold text-slate-950">{title}</h2><p className="mt-1 text-sm leading-5 text-slate-500">{description}</p></div></header><div className="flex-1 p-5 sm:p-6">{children}</div></section>;
}

function ControlRow({ title, description, status, active, children }: { title: string; description: string; status: string; active: boolean; children: React.ReactNode }) {
  return <div className="flex h-full flex-col justify-between gap-6"><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold text-slate-900">{title}</h3><span aria-live="polite" className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${active ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-slate-100 text-slate-600"}`}><span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-indigo-500" : "bg-slate-400"}`} aria-hidden="true" />{status}</span></div><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p></div><div>{children}</div></div>;
}
