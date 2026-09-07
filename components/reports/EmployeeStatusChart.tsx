"use client";

import { CircleDot } from "lucide-react";
import { EmployeeStatusReport } from "@/types/report";

const styles = {
  Active: { bar: "bg-emerald-500", dot: "bg-emerald-500", badge: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  "On Leave": { bar: "bg-amber-500", dot: "bg-amber-500", badge: "border-amber-200 bg-amber-50 text-amber-700" },
  Inactive: { bar: "bg-slate-400", dot: "bg-slate-400", badge: "border-slate-200 bg-slate-100 text-slate-600" },
};

export default function EmployeeStatusChart({ statuses }: { statuses: EmployeeStatusReport[] }) {
  const total = statuses.reduce((sum, item) => sum + item.count, 0);
  return (
    <section className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="employee-status-heading">
      <header className="flex items-start justify-between gap-4"><div><h2 id="employee-status-heading" className="text-base font-bold text-slate-950 sm:text-lg">Employee status</h2><p className="mt-1 text-sm text-slate-500">Current status composition of filtered employees.</p></div><span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700"><CircleDot size={14} aria-hidden="true" />{total}</span></header>

      {!total ? <div className="mt-6 flex min-h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 text-center text-sm text-slate-500">No employee status data matches the active filters.</div> : <>
        <div className="mt-7 flex h-3 overflow-hidden rounded-full bg-slate-100" role="img" aria-label={statuses.map((item) => `${item.status}: ${item.count} employees, ${item.percentage} percent`).join("; ")}>
          {statuses.map((item) => <div key={item.status} className={styles[item.status].bar} style={{ width: `${item.percentage}%` }} title={`${item.status}: ${item.count} (${item.percentage}%)`} />)}
        </div>
        <div className="mt-7 space-y-3">
          {statuses.map((item) => <div key={item.status} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3.5 py-3"><div className="flex min-w-0 items-center gap-2.5"><span className={`h-2.5 w-2.5 shrink-0 rounded-full ${styles[item.status].dot}`} aria-hidden="true" /><span className="truncate text-sm font-semibold text-slate-700">{item.status}</span></div><div className="flex items-center gap-2"><span className="text-sm font-bold text-slate-950">{item.count}</span><span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${styles[item.status].badge}`}>{item.percentage}%</span></div></div>)}
        </div>
      </>}
    </section>
  );
}
