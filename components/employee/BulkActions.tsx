"use client";

import { Download, Trash2, X } from "lucide-react";

type Props = { selectedCount: number; onDelete: () => void; onExport: () => void; onClear: () => void };

export default function BulkActions({ selectedCount, onDelete, onExport, onClear }: Props) {
  if (!selectedCount) return null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4 sm:flex-row sm:items-center sm:justify-between" role="region" aria-label="Bulk employee actions">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl bg-indigo-600 px-2 text-sm font-bold text-white">{selectedCount}</span>
        <div><p className="text-sm font-semibold text-slate-900">{selectedCount} employee{selectedCount === 1 ? "" : "s"} selected</p><p className="text-xs text-slate-600">Actions apply to your current selection.</p></div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={onExport} className="inline-flex h-9 items-center gap-2 rounded-lg border border-indigo-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><Download size={15} aria-hidden="true" />Export</button>
        <button type="button" onClick={onDelete} className="inline-flex h-9 items-center gap-2 rounded-lg bg-red-600 px-3 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"><Trash2 size={15} aria-hidden="true" />Delete</button>
        <button type="button" onClick={onClear} aria-label="Clear employee selection" title="Clear selection" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><X size={17} aria-hidden="true" /></button>
      </div>
    </div>
  );
}
