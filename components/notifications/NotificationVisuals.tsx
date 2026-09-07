import { Check, Info, TriangleAlert, XCircle } from "lucide-react";
import { NotificationType } from "@/types/notification";

const config = {
  success: { icon: Check, className: "border-emerald-200 bg-emerald-50 text-emerald-700", label: "Success" },
  warning: { icon: TriangleAlert, className: "border-amber-200 bg-amber-50 text-amber-700", label: "Warning" },
  info: { icon: Info, className: "border-indigo-200 bg-indigo-50 text-indigo-700", label: "Information" },
  error: { icon: XCircle, className: "border-red-200 bg-red-50 text-red-700", label: "Error" },
} satisfies Record<NotificationType, { icon: typeof Info; className: string; label: string }>;

export function NotificationTypeIcon({ type, compact = false }: { type: NotificationType; compact?: boolean }) {
  const { icon: Icon, className, label } = config[type];
  return <span className={`flex shrink-0 items-center justify-center rounded-xl border ${compact ? "h-9 w-9" : "h-10 w-10 sm:h-11 sm:w-11"} ${className}`} title={label}><Icon size={compact ? 16 : 18} aria-hidden="true" /><span className="sr-only">{label} notification</span></span>;
}

export function NotificationTimestamp({ value, compact = false }: { value: string; compact?: boolean }) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return <span className="text-xs text-slate-400">Timestamp unavailable</span>;
  const visible = compact
    ? date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  return <time dateTime={value} title={date.toLocaleString()} className="text-xs text-slate-500">{visible}</time>;
}
