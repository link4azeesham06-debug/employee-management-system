"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, CalendarDays, Eye, Mail, Pencil, Trash2 } from "lucide-react";
import StatusBadge from "@/components/employee/StatusBadge";
import { Employee } from "@/types/employee";

type Props = {
  employees: Employee[];
  editEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;
  sortColumn: keyof Employee;
  sortDirection: "asc" | "desc";
  onSort: (column: keyof Employee) => void;
  canManage?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
};

const initials = (name: string) => name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

function SortButton({ column, sortColumn, sortDirection, onSort, children }: { column: keyof Employee; sortColumn: keyof Employee; sortDirection: "asc" | "desc"; onSort: (column: keyof Employee) => void; children: React.ReactNode }) {
  const active = sortColumn === column;
  return <button type="button" onClick={() => onSort(column)} className="inline-flex items-center gap-1.5 rounded-md text-left font-semibold text-slate-600 transition hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">{children}{active ? (sortDirection === "asc" ? <ArrowUp size={14} aria-hidden="true" /> : <ArrowDown size={14} aria-hidden="true" />) : <ArrowUpDown size={14} className="text-slate-400" aria-hidden="true" />}<span className="sr-only">, sort {active && sortDirection === "asc" ? "descending" : "ascending"}</span></button>;
}

function EmployeeActions({ employee, canManage, editEmployee, deleteEmployee }: { employee: Employee; canManage: boolean; editEmployee: (employee: Employee) => void; deleteEmployee: (id: string) => void }) {
  return <div className="flex items-center justify-end gap-1">
    <Link href={`/employees/${employee.id}`} aria-label={`View ${employee.name}`} title="View employee" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><Eye size={17} aria-hidden="true" /></Link>
    {canManage && <><button type="button" onClick={() => editEmployee(employee)} aria-label={`Edit ${employee.name}`} title="Edit employee" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><Pencil size={16} aria-hidden="true" /></button><button type="button" onClick={() => deleteEmployee(employee.id)} aria-label={`Delete ${employee.name}`} title="Delete employee" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"><Trash2 size={16} aria-hidden="true" /></button></>}
  </div>;
}

export default function EmployeeTable({ employees, editEmployee, deleteEmployee, sortColumn, sortDirection, onSort, canManage = false, selectedIds = [], onSelectionChange }: Props) {
  const allSelected = employees.length > 0 && employees.every((employee) => selectedIds.includes(employee.id));
  const toggleEmployee = (id: string, checked: boolean) => onSelectionChange?.(checked ? [...selectedIds, id] : selectedIds.filter((selectedId) => selectedId !== id));

  return (
    <div className="overflow-hidden bg-white">
      <div className="hidden overflow-x-auto xl:block">
        <table className="min-w-[980px] w-full border-collapse">
          <thead className="border-b border-slate-200 bg-slate-50/80">
            <tr>
              {canManage && <th scope="col" className="w-14 px-4 py-3.5 text-left"><input type="checkbox" checked={allSelected} onChange={(event) => onSelectionChange?.(event.target.checked ? employees.map((employee) => employee.id) : [])} aria-label="Select all employees on this page" className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" /></th>}
              <th scope="col" aria-sort={sortColumn === "name" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"} className="px-4 py-3.5 text-left text-xs uppercase tracking-wide"><SortButton column="name" sortColumn={sortColumn} sortDirection={sortDirection} onSort={onSort}>Employee</SortButton></th>
              <th scope="col" aria-sort={sortColumn === "department" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"} className="px-4 py-3.5 text-left text-xs uppercase tracking-wide"><SortButton column="department" sortColumn={sortColumn} sortDirection={sortDirection} onSort={onSort}>Department</SortButton></th>
              <th scope="col" aria-sort={sortColumn === "position" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"} className="px-4 py-3.5 text-left text-xs uppercase tracking-wide"><SortButton column="position" sortColumn={sortColumn} sortDirection={sortDirection} onSort={onSort}>Position</SortButton></th>
              <th scope="col" aria-sort={sortColumn === "status" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"} className="px-4 py-3.5 text-left text-xs uppercase tracking-wide"><SortButton column="status" sortColumn={sortColumn} sortDirection={sortDirection} onSort={onSort}>Status</SortButton></th>
              <th scope="col" aria-sort={sortColumn === "joinedDate" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"} className="px-4 py-3.5 text-left text-xs uppercase tracking-wide"><SortButton column="joinedDate" sortColumn={sortColumn} sortDirection={sortDirection} onSort={onSort}>Joined</SortButton></th>
              <th scope="col" className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((employee) => <tr key={employee.id} className="group transition hover:bg-slate-50/80">
              {canManage && <td className="px-4 py-4"><input type="checkbox" checked={selectedIds.includes(employee.id)} onChange={(event) => toggleEmployee(employee.id, event.target.checked)} aria-label={`Select ${employee.name}`} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" /></td>}
              <td className="px-4 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xs font-bold text-indigo-700">{initials(employee.name)}</div><div className="min-w-0"><Link href={`/employees/${employee.id}`} className="font-semibold text-slate-900 hover:text-indigo-700">{employee.name}</Link><p className="mt-0.5 max-w-56 truncate text-xs text-slate-500">{employee.email}</p><p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{employee.employeeId}</p></div></div></td>
              <td className="px-4 py-4 text-sm font-medium text-slate-700">{employee.department}</td>
              <td className="px-4 py-4 text-sm text-slate-600">{employee.position}</td>
              <td className="px-4 py-4"><StatusBadge status={employee.status} /></td>
              <td className="px-4 py-4 text-sm text-slate-600">{employee.joinedDate}</td>
              <td className="px-4 py-4"><EmployeeActions employee={employee} canManage={canManage} editEmployee={editEmployee} deleteEmployee={deleteEmployee} /></td>
            </tr>)}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-200 xl:hidden">
        {employees.map((employee) => <article key={employee.id} className="p-4">
          <div className="flex items-start gap-3">
            {canManage && <input type="checkbox" checked={selectedIds.includes(employee.id)} onChange={(event) => toggleEmployee(employee.id, event.target.checked)} aria-label={`Select ${employee.name}`} className="mt-3 h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xs font-bold text-indigo-700">{initials(employee.name)}</div>
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><Link href={`/employees/${employee.id}`} className="font-semibold text-slate-900 hover:text-indigo-700">{employee.name}</Link><p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{employee.employeeId}</p></div><StatusBadge status={employee.status} /></div></div>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-slate-50 p-3 text-sm"><div><dt className="text-xs text-slate-500">Department</dt><dd className="mt-0.5 font-semibold text-slate-800">{employee.department}</dd></div><div><dt className="text-xs text-slate-500">Position</dt><dd className="mt-0.5 font-semibold text-slate-800">{employee.position}</dd></div><div className="col-span-2 flex items-center gap-2 text-slate-600"><Mail size={14} aria-hidden="true" /><dt className="sr-only">Email address</dt><dd className="truncate">{employee.email}</dd></div><div className="col-span-2 flex items-center gap-2 text-slate-600"><CalendarDays size={14} aria-hidden="true" /><dt className="sr-only">Joined</dt><dd>Joined {employee.joinedDate}</dd></div></dl>
          <div className="mt-3 flex justify-end"><EmployeeActions employee={employee} canManage={canManage} editEmployee={editEmployee} deleteEmployee={deleteEmployee} /></div>
        </article>)}
      </div>
    </div>
  );
}
