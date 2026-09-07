"use client";

import { Building2 } from "lucide-react";

import type { Employee } from "@/types/employee";

type Props = {
  employees: Employee[];
};

export default function TopDepartments({ employees }: Props) {
  const departmentMap: Record<string, number> = {};

  employees.forEach((employee) => {
    departmentMap[employee.department] = (departmentMap[employee.department] ?? 0) + 1;
  });

  const departments = Object.entries(departmentMap).sort(
    ([firstName, firstCount], [secondName, secondCount]) =>
      secondCount - firstCount || firstName.localeCompare(secondName)
  );
  const totalEmployees = Math.max(employees.length, 1);

  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-slate-900">Department overview</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Headcount share by department
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200">
          <Building2 size={19} aria-hidden="true" />
        </div>
      </div>

      {departments.length === 0 ? (
        <div className="flex min-h-52 items-center justify-center text-center text-sm text-slate-500">
          Department insights will appear when employee records are available.
        </div>
      ) : (
        <ol className="mt-6 space-y-5">
          {departments.map(([name, count], index) => {
            const percent = Math.round((count / totalEmployees) * 100);

            return (
              <li key={name}>
                <div className="mb-2 flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-bold text-slate-500">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
                    {name}
                  </span>
                  <span className="text-xs font-semibold tabular-nums text-slate-900">
                    {count} {count === 1 ? "employee" : "employees"}
                  </span>
                </div>
                <div className="ml-10 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-600"
                    style={{ width: `${percent}%` }}
                    aria-label={`${name}: ${percent}% of employees`}
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percent}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </article>
  );
}
