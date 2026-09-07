"use client";

import { Building2 } from "lucide-react";
import { DepartmentReport } from "@/types/report";

export default function DepartmentChart({ departments }: { departments: DepartmentReport[] }) {
  const maxTotal = Math.max(...departments.map((item) => item.total), 1);
  const workforceTotal = departments.reduce((total, item) => total + item.total, 0);

  return (
    <section className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="department-distribution-heading">
      <header className="flex items-start justify-between gap-4">
        <div><h2 id="department-distribution-heading" className="text-base font-bold text-slate-950 sm:text-lg">Department distribution</h2><p className="mt-1 text-sm text-slate-500">Headcount and status mix across the filtered workforce.</p></div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700"><Building2 size={14} aria-hidden="true" />{departments.length}</span>
      </header>

      {!departments.length ? <ChartEmptyState message="No department data matches the active filters." /> : (
        <div className="mt-6 space-y-5">
          {departments.map((department) => {
            const relativeWidth = (department.total / maxTotal) * 100;
            const workforceShare = workforceTotal ? Math.round((department.total / workforceTotal) * 100) : 0;
            return <div key={department.department}>
              <div className="mb-2 flex items-center justify-between gap-3"><p className="truncate text-sm font-semibold text-slate-800">{department.department}</p><p className="shrink-0 text-sm font-bold text-slate-950">{department.total} <span className="font-normal text-slate-400">({workforceShare}%)</span></p></div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100" role="img" aria-label={`${department.department}: ${department.total} employees, ${workforceShare} percent of filtered workforce`} title={`${department.department}: ${department.total} employees (${workforceShare}%)`}><div className="h-full rounded-full bg-indigo-600" style={{ width: `${relativeWidth}%` }} /></div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500"><span><span className="font-semibold text-emerald-700">{department.active}</span> active</span><span><span className="font-semibold text-amber-700">{department.onLeave}</span> on leave</span><span><span className="font-semibold text-slate-700">{department.inactive}</span> inactive</span></div>
            </div>;
          })}
        </div>
      )}
    </section>
  );
}

function ChartEmptyState({ message }: { message: string }) {
  return <div className="mt-6 flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 text-center"><Building2 size={24} className="text-slate-300" aria-hidden="true" /><p className="mt-3 text-sm text-slate-500">{message}</p></div>;
}
