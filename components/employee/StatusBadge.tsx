import { Employee } from "@/types/employee";

const statusStyles: Record<Employee["status"], string> = {
  Active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "On Leave": "border-amber-200 bg-amber-50 text-amber-700",
  Inactive: "border-red-200 bg-red-50 text-red-700",
};

const dotStyles: Record<Employee["status"], string> = {
  Active: "bg-emerald-500",
  "On Leave": "bg-amber-500",
  Inactive: "bg-red-500",
};

export default function StatusBadge({ status }: { status: Employee["status"] }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[status]}`} aria-hidden="true" />
      {status}
    </span>
  );
}
