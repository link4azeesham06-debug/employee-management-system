"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  departments: string[];
  statuses: string[];
  selectedDepartment: string;
  selectedStatus: string;
  onDepartmentChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onReset: () => void;
};

export default function FilterDrawer({ open, onClose, departments, statuses, selectedDepartment, selectedStatus, onDepartmentChange, onStatusChange, onReset }: Props) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), select:not([disabled])"));
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <button type="button" className="absolute inset-0 cursor-default bg-slate-950/40 backdrop-blur-[2px]" onClick={onClose} aria-label="Close employee filters" />
      <aside ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="employee-filter-title" className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl outline-none">
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-5 sm:px-6">
          <div>
            <h2 id="employee-filter-title" className="text-lg font-bold text-slate-900">Filter employees</h2>
            <p className="mt-1 text-sm text-slate-500">Narrow the directory by department or status.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close filters" className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><X size={19} aria-hidden="true" /></button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6 sm:px-6">
          <div>
            <label htmlFor="employee-department-filter" className="mb-2 block text-sm font-semibold text-slate-700">Department</label>
            <select id="employee-department-filter" value={selectedDepartment} onChange={(event) => onDepartmentChange(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10">
              {departments.map((department) => <option key={department} value={department}>{department}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="employee-status-filter" className="mb-2 block text-sm font-semibold text-slate-700">Employment status</label>
            <select id="employee-status-filter" value={selectedStatus} onChange={(event) => onStatusChange(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10">
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
        </div>

        <footer className="grid grid-cols-2 gap-3 border-t border-slate-200 bg-slate-50/80 p-5 sm:p-6">
          <button type="button" onClick={onReset} className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">Reset</button>
          <button type="button" onClick={onClose} className="h-11 rounded-xl bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">Apply filters</button>
        </footer>
      </aside>
    </div>
  );
}
