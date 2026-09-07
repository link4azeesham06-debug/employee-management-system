"use client";

import { Filter, RotateCcw } from "lucide-react";

type Props = {
  department: string;
  status: string;
  departments: string[];
  statuses: string[];
  resultCount: number;
  totalCount: number;
  onDepartmentChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onReset: () => void;
};

const selectClassName = "h-11 min-w-0 rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 sm:min-w-44";

export default function ReportFilters({ department, status, departments, statuses, resultCount, totalCount, onDepartmentChange, onStatusChange, onReset }: Props) {
  const hasFilters = department !== "All" || status !== "All";
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-labelledby="report-filter-heading">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 sm:flex" aria-hidden="true"><Filter size={18} /></div>
          <div>
            <label id="report-filter-heading" htmlFor="report-department" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Department</label>
            <select id="report-department" value={department} onChange={(event) => onDepartmentChange(event.target.value)} className={selectClassName}>{departments.map((item) => <option key={item} value={item}>{item === "All" ? "All departments" : item}</option>)}</select>
          </div>
          <div>
            <label htmlFor="report-status" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Status</label>
            <select id="report-status" value={status} onChange={(event) => onStatusChange(event.target.value)} className={selectClassName}>{statuses.map((item) => <option key={item} value={item}>{item === "All" ? "All statuses" : item}</option>)}</select>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 lg:border-0 lg:pt-0">
          <p className="text-sm text-slate-500"><span className="font-semibold text-slate-900">{resultCount}</span> of {totalCount} employee{totalCount === 1 ? "" : "s"}</p>
          {hasFilters && <button type="button" onClick={onReset} className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><RotateCcw size={15} aria-hidden="true" />Reset</button>}
        </div>
      </div>
    </section>
  );
}
