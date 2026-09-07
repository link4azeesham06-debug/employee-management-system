"use client";

import { Building2, CalendarDays, Pencil, Trash2, UserRound, Users } from "lucide-react";
import { Department } from "@/types/department";

type Props = {
  department: Department;
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
};

export default function DepartmentCard({ department, onEdit, onDelete }: Props) {
  const isActive = department.status === "Active";
  const hasAssignedEmployees = department.employeeCount > 0;

  return (
    <article className="group flex min-h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <header className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Building2 size={20} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-slate-950">{department.name}</h2>
            <span className="mt-1 inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">{department.code}</span>
          </div>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-600"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} aria-hidden="true" />
          {department.status}
        </span>
      </header>

      <p className="mt-4 line-clamp-2 min-h-12 text-sm leading-6 text-slate-500">{department.description || "No department description has been provided."}</p>

      <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
          <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><UserRound size={14} aria-hidden="true" />Department manager</dt>
          <dd className={`mt-1.5 truncate text-sm font-semibold ${department.manager ? "text-slate-900" : "text-slate-400"}`}>{department.manager || "Unassigned"}</dd>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
          <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Users size={14} aria-hidden="true" />Headcount</dt>
          <dd className="mt-1.5 text-sm font-semibold text-slate-900">{department.employeeCount} employee{department.employeeCount === 1 ? "" : "s"}</dd>
        </div>
      </dl>

      <footer className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="flex min-w-0 items-center gap-1.5 truncate text-xs text-slate-400">
          <CalendarDays size={13} className="shrink-0" aria-hidden="true" />
          {department.createdAt ? `Created ${formatDate(department.createdAt)}` : "Creation date unavailable"}
        </p>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={() => onEdit(department)} aria-label={`Edit ${department.name}`} title="Edit department" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><Pencil size={16} aria-hidden="true" /></button>
          <button type="button" onClick={() => onDelete(department)} aria-label={hasAssignedEmployees ? `Cannot delete ${department.name}; employees are assigned` : `Delete ${department.name}`} title={hasAssignedEmployees ? "Reassign employees before deleting" : "Delete department"} className={`flex h-9 w-9 items-center justify-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 ${hasAssignedEmployees ? "cursor-not-allowed text-slate-300 hover:bg-slate-50 focus-visible:ring-slate-400" : "text-slate-500 hover:bg-red-50 hover:text-red-700 focus-visible:ring-red-500"}`}><Trash2 size={16} aria-hidden="true" /></button>
        </div>
      </footer>
    </article>
  );
}

function formatDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
