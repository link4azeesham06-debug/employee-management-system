"use client";

export default function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" role="status" aria-label="Loading employees">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="h-8 w-44 rounded-lg bg-slate-200" /><div className="mt-3 h-4 w-72 max-w-full rounded bg-slate-200" /></div><div className="h-11 w-36 rounded-xl bg-slate-200" /></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="h-11 w-full rounded-xl bg-slate-100" /><div className="mt-4 h-4 w-28 rounded bg-slate-100" /></div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="hidden h-12 bg-slate-50 xl:block" />
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 6 }, (_, index) => <div key={index} className="flex items-center gap-4 p-4 sm:p-5"><div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200" /><div className="min-w-0 flex-1"><div className="h-4 w-40 max-w-full rounded bg-slate-200" /><div className="mt-2 h-3 w-56 max-w-full rounded bg-slate-100" /></div><div className="hidden h-7 w-20 rounded-full bg-slate-100 sm:block" /></div>)}
        </div>
      </div>
      <span className="sr-only">Loading employee records</span>
    </div>
  );
}
