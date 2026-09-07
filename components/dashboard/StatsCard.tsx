import type { LucideIcon } from "lucide-react";

type StatsCardProps = {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  tone: "primary" | "success" | "warning" | "neutral";
};

const toneStyles: Record<
  StatsCardProps["tone"],
  { icon: string; accent: string }
> = {
  primary: {
    icon: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    accent: "bg-indigo-600",
  },
  success: {
    icon: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    accent: "bg-emerald-600",
  },
  warning: {
    icon: "bg-amber-50 text-amber-600 ring-amber-100",
    accent: "bg-amber-600",
  },
  neutral: {
    icon: "bg-slate-100 text-slate-600 ring-slate-200",
    accent: "bg-slate-500",
  },
};

export default function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  tone,
}: StatsCardProps) {
  const styles = toneStyles[tone];

  return (
    <article className="relative min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
      <span
        className={`absolute inset-y-0 left-0 w-1 ${styles.accent}`}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value.toLocaleString()}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${styles.icon}`}
        >
          <Icon size={21} aria-hidden="true" />
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">{description}</p>
    </article>
  );
}
