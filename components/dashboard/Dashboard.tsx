"use client";

import {
  BriefcaseBusiness,
  Building2,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";

import StatsCard from "@/components/dashboard/StatsCard";

type DashboardProps = {
  displayName: string;
  totalEmployees: number;
  totalDepartments: number;
  totalPositions: number;
  activeEmployees: number;
};

export default function Dashboard({
  displayName,
  totalEmployees,
  totalDepartments,
  totalPositions,
  activeEmployees,
}: DashboardProps) {
  const cards = [
    {
      title: "Total employees",
      value: totalEmployees,
      description: "People in the current directory",
      icon: Users,
      tone: "primary" as const,
    },
    {
      title: "Departments",
      value: totalDepartments,
      description: "Teams represented in the workforce",
      icon: Building2,
      tone: "neutral" as const,
    },
    {
      title: "Positions",
      value: totalPositions,
      description: "Distinct roles across the organization",
      icon: BriefcaseBusiness,
      tone: "warning" as const,
    },
    {
      title: "Active employees",
      value: activeEmployees,
      description: "Employees currently marked active",
      icon: UserCheck,
      tone: "success" as const,
    },
  ];

  return (
    <section aria-labelledby="dashboard-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-600">
            <Sparkles size={16} aria-hidden="true" />
            <span className="truncate">Welcome back, {displayName}</span>
          </div>
          <h1
            id="dashboard-title"
            className="text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl"
          >
            Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            A clear view of your current workforce, organizational structure,
            and employee activity.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-600" aria-hidden="true" />
          Live directory · {totalEmployees.toLocaleString()} employees
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatsCard key={card.title} {...card} />
        ))}
      </div>
    </section>
  );
}
