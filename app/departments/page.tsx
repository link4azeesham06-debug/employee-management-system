"use client";

import { useMemo, useState } from "react";
import { Building2, CheckCircle2, Plus, RefreshCw, Search, Users, X, XCircle } from "lucide-react";
import toast from "react-hot-toast";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DepartmentCard from "@/components/departments/DepartmentCard";
import DepartmentForm from "@/components/departments/DepartmentForm";
import { useDepartmentContext } from "@/context/DepartmentContext";
import { Department } from "@/types/department";
import type { DepartmentCreateInput } from "@/lib/validation/department";
import { getUserErrorMessage } from "@/lib/errors/normalizeError";

export default function DepartmentsPage() {
  return <ProtectedRoute role="admin"><DepartmentsContent /></ProtectedRoute>;
}

function DepartmentsContent() {
  const { departments, loading, refreshDepartments, createDepartment, editDepartment, removeDepartment } = useDepartmentContext();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const stats = useMemo(() => ({
    total: departments.length,
    active: departments.filter((department) => department.status === "Active").length,
    inactive: departments.filter((department) => department.status === "Inactive").length,
    employeeCount: departments.reduce((total, department) => total + (department.employeeCount ?? 0), 0),
  }), [departments]);

  const filteredDepartments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return departments;
    return departments.filter((department) => department.name.toLowerCase().includes(query) || department.code.toLowerCase().includes(query) || department.manager.toLowerCase().includes(query) || department.description.toLowerCase().includes(query));
  }, [departments, search]);

  function openCreate() { setSelectedDepartment(null); setFormOpen(true); }
  function openEdit(department: Department) { setSelectedDepartment(department); setFormOpen(true); }
  function closeForm() { setFormOpen(false); setSelectedDepartment(null); }

  async function handleSubmit(data: DepartmentCreateInput) {
    try {
      if (selectedDepartment) { await editDepartment({ ...selectedDepartment, ...data }); toast.success("Department updated successfully"); }
      else { await createDepartment(data); toast.success("Department created successfully"); }
      closeForm();
    } catch (error) {
      toast.error(getUserErrorMessage(error, selectedDepartment ? "Failed to update department" : "Failed to create department"));
      throw error;
    }
  }

  async function handleDelete(department: Department) {
    if (department.employeeCount > 0) {
      toast.error(`${department.name} cannot be deleted while ${department.employeeCount} employee${department.employeeCount === 1 ? " is" : "s are"} assigned. Reassign them first.`);
      return;
    }
    const confirmed = window.confirm(`Delete "${department.name}"?\n\nThis action cannot be undone.`);
    if (!confirmed) return;
    try { await removeDepartment(department.id); toast.success("Department deleted successfully"); }
    catch (error) { toast.error(getUserErrorMessage(error, "Failed to delete department")); }
  }

  async function handleRefresh() {
    try { await refreshDepartments(); toast.success("Departments refreshed"); }
    catch (error) { toast.error(getUserErrorMessage(error, "Failed to refresh departments")); }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">Organization</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Departments</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Structure your organization, assign department ownership, and monitor workforce distribution.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm"><Building2 size={17} className="text-indigo-600" aria-hidden="true" />{stats.total} department{stats.total === 1 ? "" : "s"}</div>
          <button type="button" onClick={openCreate} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"><Plus size={18} aria-hidden="true" />Add department</button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Department summary">
        <StatCard label="Total departments" value={stats.total} icon={<Building2 size={18} />} tone="indigo" />
        <StatCard label="Active" value={stats.active} icon={<CheckCircle2 size={18} />} tone="emerald" />
        <StatCard label="Inactive" value={stats.inactive} icon={<XCircle size={18} />} tone="slate" />
        <StatCard label="Assigned employees" value={stats.employeeCount} icon={<Users size={18} />} tone="indigo" />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <label htmlFor="department-search" className="sr-only">Search departments</label>
            <input id="department-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search departments, codes or managers" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10" />
            {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear department search" className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200/70 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><X size={16} aria-hidden="true" /></button>}
          </div>
          <button type="button" onClick={handleRefresh} disabled={loading} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><RefreshCw size={17} className={loading ? "animate-spin" : ""} aria-hidden="true" />Refresh</button>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3"><p className="text-sm text-slate-500"><span className="font-semibold text-slate-800">{filteredDepartments.length}</span> result{filteredDepartments.length === 1 ? "" : "s"}</p>{search && <button type="button" onClick={() => setSearch("")} className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">Clear search</button>}</div>
      </section>

      <div><h2 className="text-base font-bold text-slate-950">Department directory</h2><p className="mt-1 text-sm text-slate-500">Ownership, status, and assigned headcount across your organization.</p></div>

      {loading && <DepartmentSkeleton />}
      {!loading && filteredDepartments.length === 0 && <EmptyState searching={Boolean(search.trim())} onCreate={openCreate} onClear={() => setSearch("")} />}
      {!loading && filteredDepartments.length > 0 && <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Department directory">{filteredDepartments.map((department) => <DepartmentCard key={department.id} department={department} onEdit={openEdit} onDelete={handleDelete} />)}</section>}
      {formOpen && <DepartmentForm open={formOpen} department={selectedDepartment} onClose={closeForm} onSubmit={handleSubmit} />}
    </div>
  );
}

function StatCard({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: "indigo" | "emerald" | "slate" }) {
  const tones = { indigo: "bg-indigo-50 text-indigo-600", emerald: "bg-emerald-50 text-emerald-600", slate: "bg-slate-100 text-slate-500" };
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-medium leading-5 text-slate-500 sm:text-sm">{label}</p><p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{value}</p></div><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${tones[tone]}`} aria-hidden="true">{icon}</div></div></article>;
}

function DepartmentSkeleton() {
  return <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading departments">{Array.from({ length: 6 }, (_, index) => <div key={index} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"><div className="flex gap-3"><div className="h-11 w-11 rounded-xl bg-slate-200" /><div className="flex-1 space-y-2"><div className="h-4 w-2/3 rounded bg-slate-200" /><div className="h-4 w-14 rounded bg-slate-100" /></div></div><div className="mt-5 h-10 rounded bg-slate-100" /><div className="mt-5 grid grid-cols-2 gap-3"><div className="h-16 rounded-xl bg-slate-100" /><div className="h-16 rounded-xl bg-slate-100" /></div></div>)}<span className="sr-only">Loading department records</span></section>;
}

function EmptyState({ searching, onCreate, onClear }: { searching: boolean; onCreate: () => void; onClear: () => void }) {
  return <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Building2 size={27} aria-hidden="true" /></div><h2 className="mt-5 text-lg font-bold text-slate-950">{searching ? "No matching departments" : "No departments yet"}</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{searching ? "Try another department name, code, manager, or description." : "Create your first department to begin organizing your workforce."}</p>{searching ? <button type="button" onClick={onClear} className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">Clear search</button> : <button type="button" onClick={onCreate} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"><Plus size={17} aria-hidden="true" />Add department</button>}</div>;
}
