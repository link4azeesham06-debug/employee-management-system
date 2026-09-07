"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Dashboard from "@/components/dashboard/Dashboard";
import EmployeeCharts from "@/components/dashboard/EmployeeCharts";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import TopDepartments from "@/components/dashboard/TopDepartments";
import { useDepartmentContext } from "@/context/DepartmentContext";
import { useAuth } from "@/hooks/useAuth";
import { useEmployees } from "@/hooks/useEmployees";

export default function DashboardPage() {
  const { user } = useAuth();
  const { employees, loading: employeesLoading } = useEmployees();
  const { departments, loading: departmentsLoading } = useDepartmentContext();

  const totalDepartments = departments.length;
  const totalPositions = new Set(
    employees.map((employee) => employee.position)
  ).size;
  const activeEmployees = employees.filter(
    (employee) => employee.status === "Active"
  ).length;
  const displayName =
    user?.role === "admin" ? "System Admin" : user?.employee?.name ?? "Employee";

  if (employeesLoading || departmentsLoading) {
    return (
      <ProtectedRoute>
        <DashboardLoadingSkeleton />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6 lg:space-y-8">
        <Dashboard
          displayName={displayName}
          totalEmployees={employees.length}
          totalDepartments={totalDepartments}
          totalPositions={totalPositions}
          activeEmployees={activeEmployees}
        />

        <EmployeeCharts employees={employees} />

        <section
          className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]"
          aria-label="Workforce insights"
        >
          <RecentActivity employees={employees} />
          <TopDepartments employees={employees} />
        </section>

        <QuickActions />
      </div>
    </ProtectedRoute>
  );
}

function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" role="status" aria-label="Loading dashboard">
      <div><div className="h-4 w-48 rounded bg-slate-200" /><div className="mt-3 h-10 w-56 rounded-lg bg-slate-200" /><div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-100" /></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-36 rounded-2xl border border-slate-200 bg-white" />)}</div>
      <div className="grid gap-6 xl:grid-cols-5"><div className="h-96 rounded-2xl border border-slate-200 bg-white xl:col-span-3" /><div className="h-96 rounded-2xl border border-slate-200 bg-white xl:col-span-2" /></div>
      <span className="sr-only">Loading current workforce data</span>
    </div>
  );
}
