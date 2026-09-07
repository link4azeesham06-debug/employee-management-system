"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, BriefcaseBusiness, Building2, CalendarDays, Hash, Mail, Pencil, User } from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EmployeeForm from "@/components/employee/EmployeeForm";
import EmployeeModal from "@/components/employee/EmployeeModal";
import StatusBadge from "@/components/employee/StatusBadge";
import { useEmployeeContext } from "@/context/EmployeeContext";
import { usePermissions } from "@/hooks/usePermissions";
import { Employee } from "@/types/employee";
import { getUserErrorMessage } from "@/lib/errors/normalizeError";

export default function EmployeeDetailsPage() {
  return <ProtectedRoute><EmployeeDetailsContent /></ProtectedRoute>;
}

function EmployeeDetailsContent() {
  const params = useParams();
  const { employees, loading, editEmployee } = useEmployeeContext();
  const { canEditEmployee, employeeEmail, employeeRecordId } = usePermissions();
  const [editing, setEditing] = useState(false);
  const employeeId = typeof params.id === "string" ? params.id : "";
  const employee = employees.find((item) => item.id === employeeId);
  const canViewEmployee = canEditEmployee || employee?.id === employeeRecordId || employee?.email.toLowerCase() === employeeEmail.toLowerCase();

  async function handleUpdate(updatedEmployee: Employee) {
    try { await editEmployee(updatedEmployee); setEditing(false); toast.success("Employee updated successfully"); }
    catch (error) { toast.error(getUserErrorMessage(error, "Failed to update employee")); }
  }

  if (loading) return <div className="space-y-6 animate-pulse" role="status" aria-label="Loading employee profile"><div className="h-5 w-32 rounded bg-slate-200" /><div className="h-52 rounded-2xl bg-white" /><div className="grid gap-5 lg:grid-cols-2"><div className="h-64 rounded-2xl bg-white" /><div className="h-64 rounded-2xl bg-white" /></div><span className="sr-only">Loading employee profile</span></div>;

  if (!employee || !canViewEmployee) return <div className="flex min-h-[460px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center"><div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><User size={27} aria-hidden="true" /></div><h1 className="text-xl font-bold text-slate-900">Employee not found</h1><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">This employee record does not exist or is not available to your account.</p><Link href="/employees" className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"><ArrowLeft size={16} aria-hidden="true" />Back to employees</Link></div>;

  const initials = employee.name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return (
    <div className="space-y-6">
      <Link href="/employees" className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-500 transition hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><ArrowLeft size={16} aria-hidden="true" />Back to employees</Link>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-20 bg-indigo-50 sm:h-24" />
        <div className="px-5 pb-6 sm:px-7">
          <div className="-mt-9 flex flex-col gap-4 sm:-mt-10 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex min-w-0 items-end gap-4"><div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-indigo-600 text-xl font-bold text-white shadow-sm">{initials}</div><div className="min-w-0 pb-1"><div className="flex flex-wrap items-center gap-2"><h1 className="truncate text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{employee.name}</h1><StatusBadge status={employee.status} /></div><p className="mt-1 text-sm text-slate-500">{employee.position} · {employee.department}</p></div></div>
            {canEditEmployee && <button type="button" onClick={() => setEditing(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"><Pencil size={16} aria-hidden="true" />Edit employee</button>}
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <InformationCard title="Contact information" description="Primary employee identity and contact details.">
          <InfoItem icon={<User size={18} />} label="Full name" value={employee.name} />
          <InfoItem icon={<Mail size={18} />} label="Email address" value={employee.email} />
        </InformationCard>
        <InformationCard title="Employment details" description="Current organization and employment record.">
          <InfoItem icon={<Hash size={18} />} label="Employee ID" value={employee.employeeId} />
          <InfoItem icon={<Building2 size={18} />} label="Department" value={employee.department} />
          <InfoItem icon={<BriefcaseBusiness size={18} />} label="Position" value={employee.position} />
          <InfoItem icon={<CalendarDays size={18} />} label="Joined date" value={employee.joinedDate} />
        </InformationCard>
      </div>

      {editing && <EmployeeModal onClose={() => setEditing(false)} title="Edit employee" description="Update this employee's profile and employment details."><EmployeeForm updateEmployee={handleUpdate} editingEmployee={employee} onCancel={() => setEditing(false)} /></EmployeeModal>}
    </div>
  );
}

function InformationCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-base font-bold text-slate-950">{title}</h2><p className="mt-1 text-sm leading-5 text-slate-500">{description}</p><dl className="mt-5 divide-y divide-slate-100">{children}</dl></section>;
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600" aria-hidden="true">{icon}</span><div className="min-w-0"><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className="mt-0.5 break-words text-sm font-semibold text-slate-900">{value}</dd></div></div>;
}
