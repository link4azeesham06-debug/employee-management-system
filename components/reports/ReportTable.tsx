"use client";

import { Building2 } from "lucide-react";
import { DepartmentReport } from "@/types/report";

export default function ReportTable({ departments }: { departments: DepartmentReport[] }) {
  const totals = departments.reduce((result, item) => ({ total: result.total + item.total, active: result.active + item.active, onLeave: result.onLeave + item.onLeave, inactive: result.inactive + item.inactive }), { total: 0, active: 0, onLeave: 0, inactive: 0 });
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="workforce-summary-heading">
      <header className="border-b border-slate-200 px-5 py-4 sm:px-6"><h2 id="workforce-summary-heading" className="text-base font-bold text-slate-950 sm:text-lg">Workforce summary</h2><p className="mt-1 text-sm text-slate-500">Department totals split by current employment status.</p></header>
      {!departments.length ? <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center"><Building2 size={24} className="text-slate-300" aria-hidden="true" /><p className="mt-3 text-sm text-slate-500">No workforce data matches the active filters.</p></div> : <>
        <div className="hidden overflow-x-auto xl:block">
          <table className="w-full min-w-[680px]"><thead className="border-b border-slate-200 bg-slate-50/80"><tr><th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Department</th><th scope="col" className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Total</th><th scope="col" className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Active</th><th scope="col" className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">On leave</th><th scope="col" className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Inactive</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{departments.map((item) => <tr key={item.department} className="transition hover:bg-slate-50/80"><th scope="row" className="px-5 py-3.5 text-left text-sm font-semibold text-slate-900">{item.department}</th><td className="px-5 py-3.5 text-right text-sm font-bold text-slate-950">{item.total}</td><StatusCell value={item.active} tone="emerald" /><StatusCell value={item.onLeave} tone="amber" /><StatusCell value={item.inactive} tone="slate" /></tr>)}</tbody>
            <tfoot className="border-t border-slate-200 bg-slate-50/80"><tr><th scope="row" className="px-5 py-3.5 text-left text-sm font-bold text-slate-950">Filtered total</th><td className="px-5 py-3.5 text-right text-sm font-bold text-slate-950">{totals.total}</td><td className="px-5 py-3.5 text-right text-sm font-bold text-emerald-700">{totals.active}</td><td className="px-5 py-3.5 text-right text-sm font-bold text-amber-700">{totals.onLeave}</td><td className="px-5 py-3.5 text-right text-sm font-bold text-slate-700">{totals.inactive}</td></tr></tfoot>
          </table>
        </div>
        <div className="divide-y divide-slate-200 xl:hidden">{departments.map((item) => <article key={item.department} className="p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-slate-900">{item.department}</h3><span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-sm font-bold text-indigo-700">{item.total} total</span></div><dl className="mt-3 grid grid-cols-3 gap-2"><MobileMetric label="Active" value={item.active} tone="text-emerald-700" /><MobileMetric label="On leave" value={item.onLeave} tone="text-amber-700" /><MobileMetric label="Inactive" value={item.inactive} tone="text-slate-700" /></dl></article>)}</div>
      </>}
    </section>
  );
}

function StatusCell({ value, tone }: { value: number; tone: "emerald" | "amber" | "slate" }) {
  const styles = { emerald: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", slate: "bg-slate-100 text-slate-700" };
  return <td className="px-5 py-3.5 text-right"><span className={`inline-flex min-w-8 justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${styles[tone]}`}>{value}</span></td>;
}

function MobileMetric({ label, value, tone }: { label: string; value: number; tone: string }) {
  return <div className="rounded-xl bg-slate-50 p-2.5 text-center"><dt className="text-[11px] text-slate-500">{label}</dt><dd className={`mt-1 text-sm font-bold ${tone}`}>{value}</dd></div>;
}
