"use client";

import { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  iconClassName?: string;
};

export default function MetricCard({ title, value, description, icon: Icon, iconClassName = "bg-indigo-50 text-indigo-600" }: Props) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium leading-5 text-slate-500 sm:text-sm">{title}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{value.toLocaleString()}</p>
        </div>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${iconClassName}`} aria-hidden="true"><Icon size={18} /></div>
      </div>
      <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">{description}</p>
    </article>
  );
}
