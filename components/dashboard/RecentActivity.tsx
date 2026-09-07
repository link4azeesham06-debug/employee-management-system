"use client";

import { CalendarDays, UserPlus, Users } from "lucide-react";

import type { Employee } from "@/types/employee";

type Props = {
  employees: Employee[];
};

const statusStyles: Record<Employee["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  "On Leave": "bg-amber-50 text-amber-700 ring-amber-600/15",
  Inactive: "bg-red-50 text-red-700 ring-red-600/15",
};

function formatDate(value: string) {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RecentActivity({ employees }: Props) {
  const latest = [...employees]
    .sort(
      (first, second) =>
        new Date(second.joinedDate).getTime() - new Date(first.joinedDate).getTime()
    )
    .slice(0, 5);

  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
        <div>
          <h2 className="font-semibold text-slate-900">Recent workforce activity</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Most recently joined employees
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100">
          <UserPlus size={19} aria-hidden="true" />
        </div>
      </div>

      {latest.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <Users size={22} aria-hidden="true" />
          </div>
          <p className="mt-4 font-semibold text-slate-700">No recent activity</p>
          <p className="mt-1 text-sm text-slate-500">
            New employee records will appear here.
          </p>
        </div>
      ) : (
        <ol className="divide-y divide-slate-100 px-5 sm:px-6">
          {latest.map((employee) => {
            const initials = employee.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <li
                key={employee.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600 ring-1 ring-inset ring-slate-200">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {employee.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      Joined {employee.department} as {employee.position}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pl-[3.25rem] sm:justify-end sm:pl-0">
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-slate-500">
                    <CalendarDays size={13} aria-hidden="true" />
                    <time dateTime={employee.joinedDate}>
                      {formatDate(employee.joinedDate)}
                    </time>
                  </span>
                  <span
                    className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${statusStyles[employee.status]}`}
                  >
                    {employee.status}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </article>
  );
}
