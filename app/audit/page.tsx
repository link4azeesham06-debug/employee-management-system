"use client";

import { useMemo, useState } from "react";
import { Activity, CalendarDays, CheckCircle2, ClipboardList, Download, Filter, RefreshCcw, Search, ShieldCheck, Trash2, User, X } from "lucide-react";
import toast from "react-hot-toast";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAudit } from "@/context/AuditContext";
import { useAuth } from "@/hooks/useAuth";
import { AuditAction, AuditEntity, AuditLog } from "@/types/audit";
import { getUserErrorMessage } from "@/lib/errors/normalizeError";

const actions: Array<AuditAction | "All"> = ["All", "CREATE", "UPDATE", "STATUS_CHANGE", "DELETE", "LOGIN", "LOGOUT", "EXPORT"];
const entities: Array<AuditEntity | "All"> = ["All", "Employee", "Department", "User", "Report", "System"];

export default function AuditPage() {
  return <ProtectedRoute role="admin"><AuditContent /></ProtectedRoute>;
}

function AuditContent() {
  const { logs, loading, removeLog, clearLogs } = useAudit();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<AuditAction | "All">("All");
  const [entityFilter, setEntityFilter] = useState<AuditEntity | "All">("All");
  const isAdmin = user?.role === "admin";

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return logs.filter((log) => {
      const matchesSearch = !query || log.description.toLowerCase().includes(query) || log.performedBy.toLowerCase().includes(query) || log.entity.toLowerCase().includes(query) || log.action.toLowerCase().includes(query);
      return matchesSearch && (actionFilter === "All" || log.action === actionFilter) && (entityFilter === "All" || log.entity === entityFilter);
    });
  }, [actionFilter, entityFilter, logs, search]);

  const stats = useMemo(() => ({
    total: logs.length,
    today: logs.filter((log) => new Date(log.createdAt).toDateString() === new Date().toDateString()).length,
    creates: logs.filter((log) => log.action === "CREATE").length,
    updates: logs.filter((log) => log.action === "UPDATE").length,
  }), [logs]);

  const hasFilters = Boolean(search || actionFilter !== "All" || entityFilter !== "All");
  function resetFilters() { setSearch(""); setActionFilter("All"); setEntityFilter("All"); }

  async function handleDelete(id: string) {
    try { await removeLog(id); toast.success("Audit entry removed"); }
    catch (error) { toast.error(getUserErrorMessage(error, "Failed to remove audit entry")); }
  }

  async function handleClear() {
    if (!logs.length) return;
    if (!window.confirm("Clear all audit logs? This action cannot be undone.")) return;
    try { await clearLogs(); toast.success("Audit log cleared"); }
    catch (error) { toast.error(getUserErrorMessage(error, "Failed to clear audit logs")); }
  }

  function exportLogs() {
    if (!filteredLogs.length) { toast.error("There are no audit records to export."); return; }
    const headers = ["Date", "Action", "Entity", "Description", "Performed By", "Role"];
    const rows = filteredLogs.map((log) => [new Date(log.createdAt).toLocaleString(), log.action, log.entity, log.description, log.performedBy, log.performedByRole]);
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `hr-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Audit report exported");
  }

  if (loading) return <AuditLoadingSkeleton />;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600"><ShieldCheck size={15} aria-hidden="true" />Security &amp; compliance</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Audit Logs</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Review persisted administrative and workforce activity across the HR system.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm"><ClipboardList size={17} className="text-indigo-600" aria-hidden="true" />{logs.length} event{logs.length === 1 ? "" : "s"}</div>
          <button type="button" onClick={exportLogs} disabled={!filteredLogs.length} aria-label="Export filtered audit logs as CSV" className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"><Download size={17} aria-hidden="true" />Export CSV</button>
          {isAdmin && <button type="button" onClick={handleClear} disabled={!logs.length} className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500" aria-label="Clear all audit logs"><Trash2 size={17} aria-hidden="true" />Clear all</button>}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Audit activity summary">
        <StatCard title="Total events" value={stats.total} icon={ClipboardList} tone="indigo" />
        <StatCard title="Today" value={stats.today} icon={Activity} tone="emerald" />
        <StatCard title="Creates" value={stats.creates} icon={CheckCircle2} tone="emerald" />
        <StatCard title="Updates" value={stats.updates} icon={CalendarDays} tone="amber" />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-label="Audit log filters">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <label htmlFor="audit-search" className="sr-only">Search audit activity</label>
            <input id="audit-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search activity, actor, entity or action" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10" />
            {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear audit search" className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200/70 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><X size={16} aria-hidden="true" /></button>}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <div className="relative"><Filter size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" /><label htmlFor="audit-action-filter" className="sr-only">Filter by action</label><select id="audit-action-filter" value={actionFilter} onChange={(event) => setActionFilter(event.target.value as AuditAction | "All")} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-8 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 sm:w-44">{actions.map((action) => <option key={action} value={action}>{action === "All" ? "All actions" : action.replace("_", " ")}</option>)}</select></div>
            <div><label htmlFor="audit-entity-filter" className="sr-only">Filter by entity</label><select id="audit-entity-filter" value={entityFilter} onChange={(event) => setEntityFilter(event.target.value as AuditEntity | "All")} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 sm:w-44">{entities.map((entity) => <option key={entity} value={entity}>{entity === "All" ? "All entities" : entity}</option>)}</select></div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3"><p className="text-sm text-slate-500"><span className="font-semibold text-slate-900">{filteredLogs.length}</span> of {logs.length} event{logs.length === 1 ? "" : "s"}</p>{hasFilters && <button type="button" onClick={resetFilters} className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><RefreshCcw size={14} aria-hidden="true" />Reset filters</button>}</div>
      </section>

      <AuditDirectory logs={filteredLogs} isAdmin={isAdmin} hasFilters={hasFilters} onDelete={handleDelete} onReset={resetFilters} />
    </div>
  );
}

function AuditDirectory({ logs, isAdmin, hasFilters, onDelete, onReset }: { logs: AuditLog[]; isAdmin: boolean; hasFilters: boolean; onDelete: (id: string) => void; onReset: () => void }) {
  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="activity-history-heading">
    <header className="border-b border-slate-200 px-5 py-4 sm:px-6"><h2 id="activity-history-heading" className="text-base font-bold text-slate-950 sm:text-lg">Activity history</h2><p className="mt-1 text-sm text-slate-500">A chronological record of persisted system events.</p></header>
    {!logs.length ? <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><ShieldCheck size={27} aria-hidden="true" /></div><h3 className="mt-5 text-lg font-bold text-slate-950">{hasFilters ? "No matching audit events" : "No audit activity yet"}</h3><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{hasFilters ? "Adjust or reset the current search and filters." : "Persisted security and administrative activity will appear here automatically."}</p>{hasFilters && <button type="button" onClick={onReset} className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">Reset filters</button>}</div> : <>
      <div className="hidden overflow-x-auto xl:block"><table className="w-full min-w-[1040px]"><thead className="border-b border-slate-200 bg-slate-50/80"><tr><th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Timestamp</th><th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Actor</th><th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Action</th><th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Entity</th><th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Description</th>{isAdmin && <th scope="col" className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Control</th>}</tr></thead><tbody className="divide-y divide-slate-100">{logs.map((log) => <AuditTableRow key={log.id} log={log} isAdmin={isAdmin} onDelete={onDelete} />)}</tbody></table></div>
      <div className="divide-y divide-slate-200 xl:hidden">{logs.map((log) => <AuditCard key={log.id} log={log} isAdmin={isAdmin} onDelete={onDelete} />)}</div>
    </>}
  </section>;
}

function AuditTableRow({ log, isAdmin, onDelete }: { log: AuditLog; isAdmin: boolean; onDelete: (id: string) => void }) {
  return <tr className="transition hover:bg-slate-50/80"><td className="whitespace-nowrap px-5 py-4"><Timestamp value={log.createdAt} /></td><td className="px-5 py-4"><Actor log={log} /></td><td className="px-5 py-4"><ActionBadge action={log.action} /></td><td className="px-5 py-4"><EntityBadge entity={log.entity} /></td><td className="px-5 py-4"><p className="max-w-md text-sm leading-5 text-slate-700">{log.description}</p></td>{isAdmin && <td className="px-5 py-4 text-right"><DeleteButton log={log} onDelete={onDelete} /></td>}</tr>;
}

function AuditCard({ log, isAdmin, onDelete }: { log: AuditLog; isAdmin: boolean; onDelete: (id: string) => void }) {
  return <article className="p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><div className="flex flex-wrap items-center gap-2"><ActionBadge action={log.action} /><EntityBadge entity={log.entity} /></div>{isAdmin && <DeleteButton log={log} onDelete={onDelete} />}</div><p className="mt-3 text-sm font-medium leading-6 text-slate-800">{log.description}</p><div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between"><Actor log={log} /><Timestamp value={log.createdAt} /></div></article>;
}

function Actor({ log }: { log: AuditLog }) {
  const actor = log.performedBy.trim() || "System user";
  return <div className="flex min-w-0 items-center gap-2.5"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><User size={15} aria-hidden="true" /></div><div className="min-w-0"><p className="max-w-48 truncate text-sm font-semibold text-slate-800" title={actor}>{actor}</p><p className="text-xs capitalize text-slate-500">{log.performedByRole}</p></div></div>;
}

function Timestamp({ value }: { value: string }) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return <span className="text-sm text-slate-500">Invalid timestamp</span>;
  return <time dateTime={value} title={date.toLocaleString()} className="block"><span className="block text-sm font-semibold text-slate-700">{date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span><span className="mt-0.5 block text-xs text-slate-500">{date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", second: "2-digit" })}</span></time>;
}

function ActionBadge({ action }: { action: AuditAction }) {
  const styles: Record<AuditAction, string> = { CREATE: "border-emerald-200 bg-emerald-50 text-emerald-700", UPDATE: "border-indigo-200 bg-indigo-50 text-indigo-700", STATUS_CHANGE: "border-amber-200 bg-amber-50 text-amber-700", DELETE: "border-red-200 bg-red-50 text-red-700", LOGIN: "border-indigo-200 bg-indigo-50 text-indigo-700", LOGOUT: "border-slate-200 bg-slate-100 text-slate-700", EXPORT: "border-amber-200 bg-amber-50 text-amber-700" };
  return <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide ${styles[action]}`}>{action.replace("_", " ")}</span>;
}

function EntityBadge({ entity }: { entity: AuditEntity }) {
  return <span className="inline-flex rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600">{entity}</span>;
}

function DeleteButton({ log, onDelete }: { log: AuditLog; onDelete: (id: string) => void }) {
  return <button type="button" onClick={() => onDelete(log.id)} aria-label={`Delete ${log.action.toLowerCase().replace("_", " ")} audit event by ${log.performedBy}`} title="Delete audit event" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"><Trash2 size={16} aria-hidden="true" /></button>;
}

function StatCard({ title, value, icon: Icon, tone }: { title: string; value: number; icon: typeof Activity; tone: "indigo" | "emerald" | "amber" }) {
  const styles = { indigo: "bg-indigo-50 text-indigo-600", emerald: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600" };
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium leading-5 text-slate-500 sm:text-sm">{title}</p><p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{value}</p></div><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${styles[tone]}`} aria-hidden="true"><Icon size={18} /></div></div></article>;
}

function AuditLoadingSkeleton() {
  return <div className="space-y-6 animate-pulse" role="status" aria-label="Loading audit logs"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="h-8 w-44 rounded-lg bg-slate-200" /><div className="mt-3 h-4 w-80 max-w-full rounded bg-slate-200" /></div><div className="h-11 w-40 rounded-xl bg-slate-200" /></div><div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-28 rounded-2xl bg-white" />)}</div><div className="h-24 rounded-2xl bg-white" /><div className="h-96 rounded-2xl bg-white" /><span className="sr-only">Loading persisted audit activity</span></div>;
}
