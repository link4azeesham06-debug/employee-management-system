"use client";

import { SearchX, Users } from "lucide-react";

type Props = { search?: string; hasFilters?: boolean; onClear?: () => void };

export default function EmptyState({ search = "", hasFilters = false, onClear }: Props) {
  const filtered = Boolean(search.trim() || hasFilters);
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">{filtered ? <SearchX size={27} aria-hidden="true" /> : <Users size={27} aria-hidden="true" />}</div>
      <h2 className="text-lg font-bold text-slate-900">{filtered ? "No matching employees" : "No employees yet"}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{filtered ? "Try a different search or clear your active filters." : "Employee records will appear here once they are added."}</p>
      {filtered && onClear && <button type="button" onClick={onClear} className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">Clear filters</button>}
    </div>
  );
}
