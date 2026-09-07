"use client";

import { useMemo, useState } from "react";
import { BarChart3, BriefcaseBusiness, Building2, Download, Users } from "lucide-react";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DepartmentChart from "@/components/reports/DepartmentChart";
import EmployeeStatusChart from "@/components/reports/EmployeeStatusChart";
import HiringTrendChart from "@/components/reports/HiringTrendChart";
import MetricCard from "@/components/reports/MetricCard";
import ReportFilters from "@/components/reports/ReportFilters";
import ReportTable from "@/components/reports/ReportTable";
import { useEmployees } from "@/hooks/useEmployees";
import { generateHRReport } from "@/services/reportService";
import { exportEmployeesToCSV } from "@/utils/exportEmployees";
import { useAudit } from "@/context/AuditContext";
import { useAuth } from "@/hooks/useAuth";
import { useDepartmentContext } from "@/context/DepartmentContext";

export default function ReportsPage() {
  return <ProtectedRoute role="admin"><ReportsContent /></ProtectedRoute>;
}

function ReportsContent() {
  const { employees, loading } = useEmployees();
  const { departments: organizationDepartments, loading: departmentsLoading } = useDepartmentContext();
  const { addLog } = useAudit();
  const { user } = useAuth();
  const [department, setDepartment] = useState("All");
  const [status, setStatus] = useState("All");
  const departmentOptions = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set([
          ...organizationDepartments.map((item) => item.name),
          ...employees.map((employee) => employee.department),
        ]),
      ),
    ],
    [employees, organizationDepartments],
  );
  const filteredEmployees = useMemo(
    () => employees.filter((employee) =>
      (department === "All" || employee.department === department) &&
      (status === "All" || employee.status === status)),
    [department, employees, status],
  );
  const report = useMemo(() => generateHRReport(filteredEmployees), [filteredEmployees]);

  async function handleExport() {
    if (!filteredEmployees.length) {
      toast.error("There is no report data to export.");
      return;
    }

    exportEmployeesToCSV(filteredEmployees);
    await addLog({
      action: "EXPORT",
      entity: "Report",
      description: `Exported workforce report with ${filteredEmployees.length} employee records`,
      performedBy: user?.email ?? "System Admin",
      performedByRole: "admin",
      metadata: { recordCount: filteredEmployees.length },
    });
    toast.success("Report exported successfully");
  }

  if (loading || departmentsLoading) return <ReportLoadingSkeleton />;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600"><BarChart3 size={15} aria-hidden="true" />Analytics</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Reports &amp; Analytics</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Executive workforce insights calculated from current employee and department records.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm"><Users size={17} className="text-indigo-600" aria-hidden="true" />{filteredEmployees.length} employee{filteredEmployees.length === 1 ? "" : "s"} analyzed</div>
          <button type="button" onClick={handleExport} disabled={!filteredEmployees.length} aria-label="Export filtered workforce report as CSV" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"><Download size={17} aria-hidden="true" />Export CSV</button>
        </div>
      </section>
      <ReportFilters department={department} status={status} departments={departmentOptions} statuses={["All", "Active", "On Leave", "Inactive"]} resultCount={filteredEmployees.length} totalCount={employees.length} onDepartmentChange={setDepartment} onStatusChange={setStatus} onReset={() => { setDepartment("All"); setStatus("All"); }} />
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Workforce report metrics">
        <MetricCard title="Total Employees" value={report.summary.totalEmployees} description="Matching the active filters" icon={Users} />
        <MetricCard title="Active Employees" value={report.summary.activeEmployees} description="Currently active" icon={Users} iconClassName="bg-emerald-50 text-emerald-600" />
        <MetricCard title="Departments" value={organizationDepartments.length} description="Configured organizational units" icon={Building2} iconClassName="bg-indigo-50 text-indigo-600" />
        <MetricCard title="Positions" value={report.summary.totalPositions} description="Distinct roles in this report" icon={BriefcaseBusiness} iconClassName="bg-amber-50 text-amber-600" />
      </section>
      <section className="grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2"><DepartmentChart departments={report.departments} /></div>
        <EmployeeStatusChart statuses={report.statuses} />
      </section>
      <HiringTrendChart data={report.hiringTrend} />
      <ReportTable departments={report.departments} />
    </div>
  );
}

function ReportLoadingSkeleton() {
  return <div className="space-y-6 animate-pulse" role="status" aria-label="Loading reports"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="h-8 w-64 rounded-lg bg-slate-200" /><div className="mt-3 h-4 w-80 max-w-full rounded bg-slate-200" /></div><div className="h-11 w-36 rounded-xl bg-slate-200" /></div><div className="h-24 rounded-2xl bg-white" /><div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-32 rounded-2xl bg-white" />)}</div><div className="grid gap-5 xl:grid-cols-3"><div className="h-96 rounded-2xl bg-white xl:col-span-2" /><div className="h-96 rounded-2xl bg-white" /></div><span className="sr-only">Loading workforce analytics</span></div>;
}
