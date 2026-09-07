"use client";

import { BadgeCheck, BriefcaseBusiness, Building2, CalendarDays, Hash, Mail, Shield, User, UserRound } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import StatusBadge from "@/components/employee/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { useEmployees } from "@/hooks/useEmployees";

export default function ProfilePage() {
  return <ProtectedRoute><ProfileContent /></ProtectedRoute>;
}

function ProfileContent() {
  const { user } = useAuth();
  const { employees, loading } = useEmployees();

  if (!user) return <ProfileUnavailable title="Profile unavailable" message="Your authenticated profile could not be loaded. Please sign in again." />;

  const isEmployee = user.role === "employee";
  const employee = isEmployee
    ? employees.find((item) => item.id === user.employee?.id || item.id === user.id || item.email.toLowerCase() === user.email.toLowerCase()) ?? user.employee
    : undefined;
  const displayName = employee?.name ?? (user.role === "admin" ? "System Admin" : user.email || "Employee");

  if (isEmployee && loading && !employee) return <ProfileLoadingSkeleton />;
  if (isEmployee && !employee) return <ProfileUnavailable title="Employment profile unavailable" message="Your account is authenticated, but its linked employee information is currently unavailable." />;

  const initials = displayName.split(" ").filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "U";
  const roleLabel = user.role === "admin" ? "Administrator" : "Employee";

  return (
    <div className="space-y-6">
      <header>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">Account</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">My Profile</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Your authenticated account identity and organization information.</p>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="profile-name">
        <div className="h-20 bg-indigo-50 sm:h-24" />
        <div className="px-5 pb-6 sm:px-7 sm:pb-7">
          <div className="-mt-9 flex flex-col gap-4 sm:-mt-10 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex min-w-0 items-end gap-4">
              <div role="img" aria-label={`${displayName} profile initials ${initials}`} className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-indigo-600 text-xl font-bold text-white shadow-sm">{initials}</div>
              <div className="min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2"><h2 id="profile-name" className="truncate text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{displayName}</h2>{employee && <StatusBadge status={employee.status} />}</div>
                <p className="mt-1 text-sm text-slate-500">{employee ? `${employee.position} · ${employee.department}` : "HR Management System administrator"}</p>
              </div>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700"><Shield size={16} aria-hidden="true" />{roleLabel}</span>
          </div>
        </div>
      </section>

      <div className={`grid gap-5 ${employee ? "lg:grid-cols-2" : "max-w-3xl"}`}>
        <InformationCard title="Account information" description="Identity details associated with your authenticated account.">
          <InfoItem icon={<Mail size={18} />} label="Email address" value={user.email} />
          <InfoItem icon={<Shield size={18} />} label="Account role" value={roleLabel} />
          <InfoItem icon={<UserRound size={18} />} label="Profile type" value={isEmployee ? "Employee account" : "Administrative account"} />
        </InformationCard>

        {employee && <InformationCard title="Employment information" description="Your current employee record within the organization.">
          <InfoItem icon={<Hash size={18} />} label="Employee ID" value={employee.employeeId || "Not assigned"} />
          <InfoItem icon={<Building2 size={18} />} label="Department" value={employee.department || "Not assigned"} />
          <InfoItem icon={<BriefcaseBusiness size={18} />} label="Position" value={employee.position || "Not assigned"} />
          <InfoItem icon={<BadgeCheck size={18} />} label="Employment status" value={<StatusBadge status={employee.status} />} />
          <InfoItem icon={<CalendarDays size={18} />} label="Joined date" value={formatDate(employee.joinedDate)} />
        </InformationCard>}
      </div>
    </div>
  );
}

function InformationCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-base font-bold text-slate-950 sm:text-lg">{title}</h2><p className="mt-1 text-sm leading-5 text-slate-500">{description}</p><dl className="mt-5 divide-y divide-slate-100">{children}</dl></section>;
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return <div className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600" aria-hidden="true">{icon}</span><div className="min-w-0"><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</dd></div></div>;
}

function ProfileUnavailable({ title, message }: { title: string; message: string }) {
  return <div className="flex min-h-[460px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><User size={27} aria-hidden="true" /></span><h1 className="mt-5 text-xl font-bold text-slate-950">{title}</h1><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{message}</p></div>;
}

function ProfileLoadingSkeleton() {
  return <div className="space-y-6 animate-pulse" role="status" aria-label="Loading profile"><div><div className="h-8 w-40 rounded-lg bg-slate-200" /><div className="mt-3 h-4 w-72 max-w-full rounded bg-slate-200" /></div><div className="h-52 rounded-2xl bg-white" /><div className="grid gap-5 lg:grid-cols-2"><div className="h-72 rounded-2xl bg-white" /><div className="h-72 rounded-2xl bg-white" /></div><span className="sr-only">Loading profile information</span></div>;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
