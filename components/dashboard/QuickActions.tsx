"use client";

import Link from "next/link";
import {
  BarChart3,
  Building2,
  ChevronRight,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";

import { usePermissions } from "@/hooks/usePermissions";

export default function QuickActions() {
  const { role, canViewReports, canManageDepartments } = usePermissions();

  const actions = [
    {
      label: "Employee directory",
      description: role === "admin" ? "View and manage employees" : "View your employee record",
      href: "/employees",
      icon: Users,
      visible: true,
    },
    {
      label: "Workforce reports",
      description: "Review organizational analytics",
      href: "/reports",
      icon: BarChart3,
      visible: canViewReports,
    },
    {
      label: "Departments",
      description: "Manage teams and assignments",
      href: "/departments",
      icon: Building2,
      visible: canManageDepartments,
    },
    {
      label: role === "admin" ? "Settings" : "My profile",
      description:
        role === "admin" ? "Open administrative controls" : "Review your profile details",
      href: role === "admin" ? "/settings" : "/profile",
      icon: role === "admin" ? Settings : UserCircle,
      visible: true,
    },
  ].filter((action) => action.visible);

  return (
    <section aria-labelledby="quick-actions-title">
      <div className="mb-4">
        <h2 id="quick-actions-title" className="text-xl font-bold text-slate-900">
          Quick actions
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Jump to the tools available for your role.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className="group flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100 transition group-hover:bg-indigo-600 group-hover:text-white">
                <Icon size={18} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {action.label}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {action.description}
                </p>
              </div>
              <ChevronRight
                size={16}
                className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-600"
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
