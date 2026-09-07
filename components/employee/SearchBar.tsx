"use client";

import { Download, Search, SlidersHorizontal, X } from "lucide-react";

type Props = {
  search: string;
  resultCount: number;
  activeFilterCount: number;
  canExport: boolean;
  onSearchChange: (value: string) => void;
  onOpenFilters: () => void;
  onClear: () => void;
  onExport: () => void;
  onResetFilters: () => void;
};

export default function SearchBar({
  search,
  resultCount,
  activeFilterCount,
  canExport,
  onSearchChange,
  onOpenFilters,
  onClear,
  onExport,
  onResetFilters,
}: Props) {
  const hasFilters = Boolean(search || activeFilterCount);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
          <label htmlFor="employee-search" className="sr-only">Search employees</label>
          <input
            id="employee-search"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name, email or employee ID"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          />
          {search && (
            <button type="button" onClick={onClear} aria-label="Clear employee search" className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200/70 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className={canExport ? "grid grid-cols-2 gap-2 sm:flex" : "flex"}>
          <button type="button" onClick={onOpenFilters} className="relative inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
            <SlidersHorizontal size={17} aria-hidden="true" />
            Filters
            {activeFilterCount > 0 && <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[11px] font-bold text-white" aria-label={`${activeFilterCount} active filters`}>{activeFilterCount}</span>}
          </button>
          {canExport && (
            <button type="button" onClick={onExport} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
              <Download size={17} aria-hidden="true" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <p className="text-sm text-slate-500"><span className="font-semibold text-slate-800">{resultCount}</span> result{resultCount === 1 ? "" : "s"}</p>
        {hasFilters && <button type="button" onClick={onResetFilters} className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">Clear all filters</button>}
      </div>
    </div>
  );
}
