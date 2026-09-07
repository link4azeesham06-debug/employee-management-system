"use client";

import { CalendarRange } from "lucide-react";
import { HiringTrend } from "@/types/report";

export default function HiringTrendChart({ data }: { data: HiringTrend[] }) {
  const maxHires = Math.max(...data.map((item) => item.hires), 1);
  const totalHires = data.reduce((total, item) => total + item.hires, 0);
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="hiring-trend-heading">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><h2 id="hiring-trend-heading" className="text-base font-bold text-slate-950 sm:text-lg">Hiring timeline</h2><p className="mt-1 text-sm text-slate-500">Actual employee additions grouped by available joined dates.</p></div>{data.length > 0 && <span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700"><CalendarRange size={14} aria-hidden="true" />{totalHires} hires across {data.length} month{data.length === 1 ? "" : "s"}</span>}</header>

      {!data.length ? <div className="mt-6 flex min-h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 text-center text-sm text-slate-500">No valid joined-date history is available for the current filters.</div> : (
        <div className="mt-7 overflow-x-auto pb-1">
          <div className="flex min-h-64 min-w-max items-end gap-3 border-b border-slate-200 px-1 pt-6 sm:min-w-full" role="img" aria-label={`Hiring timeline: ${data.map((item) => `${item.month}, ${item.hires} hires`).join("; ")}`}>
            {data.map((item) => {
              const height = (item.hires / maxHires) * 100;
              return <div key={item.month} className="flex min-w-16 flex-1 flex-col items-center justify-end gap-2.5"><span className="text-xs font-bold text-slate-700">{item.hires}</span><div className="flex h-44 w-full items-end justify-center rounded-t-lg bg-slate-50"><div className="w-7 rounded-t-md bg-indigo-600 transition hover:bg-indigo-700" style={{ height: `${Math.max(height, 5)}%` }} title={`${item.month}: ${item.hires} hire${item.hires === 1 ? "" : "s"}`} /></div><span className="pb-3 text-center text-[11px] font-medium text-slate-500">{item.month}</span></div>;
            })}
          </div>
        </div>
      )}
    </section>
  );
}
