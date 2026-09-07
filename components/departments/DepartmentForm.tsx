"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { Building2, Loader2, X } from "lucide-react";
import { Department, DepartmentStatus } from "@/types/department";
import { useEmployees } from "@/hooks/useEmployees";
import {
  departmentCreateSchema,
  departmentUpdateSchema,
  type DepartmentCreateInput,
} from "@/lib/validation/department";
import {
  normalizeValidationError,
  type ValidationFieldErrors,
} from "@/lib/validation/errors";

type Props = {
  open: boolean;
  department?: Department | null;
  onClose: () => void;
  onSubmit: (department: DepartmentCreateInput) => Promise<void>;
};

type FormState = { name: string; code: string; description: string; manager: string; status: DepartmentStatus };
const emptyForm: FormState = { name: "", code: "", description: "", manager: "", status: "Active" };
const controlClassName = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

export default function DepartmentForm({ open, department, onClose, onSubmit }: Props) {
  const { employees } = useEmployees();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<FormState>(() => department ? { name: department.name, code: department.code, description: department.description, manager: department.manager, status: department.status } : emptyForm);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ValidationFieldErrors>({});
  const editing = Boolean(department);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", handleKeyDown); previousFocus?.focus(); };
  }, [onClose, open, saving]);

  if (!open) return null;

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    if (validationError) setValidationError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = department
      ? departmentUpdateSchema.safeParse({ id: department.id, ...form })
      : departmentCreateSchema.safeParse(form);

    if (!result.success) {
      const normalized = normalizeValidationError(result.error);
      setValidationError(normalized.message);
      setFieldErrors(normalized.fieldErrors);
      return;
    }

    const validated: DepartmentCreateInput = {
      name: result.data.name,
      code: result.data.code,
      description: result.data.description,
      manager: result.data.manager,
      status: result.data.status,
    };

    try {
      setSaving(true); setValidationError(""); setFieldErrors({});
      await onSubmit(validated);
      onClose();
    } catch {
      // The page owns service error feedback and keeps the form open for correction.
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-[2px] sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl outline-none sm:max-h-[calc(100dvh-3rem)]">
        <header className="flex shrink-0 items-start justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Building2 size={19} aria-hidden="true" /></div><div><h2 id={titleId} className="text-lg font-bold text-slate-950">{editing ? "Edit department" : "Add department"}</h2><p className="mt-0.5 text-sm text-slate-500">{editing ? "Update department ownership and details." : "Create a new organizational department."}</p></div></div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close department form" className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><X size={19} aria-hidden="true" /></button>
        </header>

        <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
            {validationError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-medium text-red-700">{validationError}</p>}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field id="department-name" label="Department name" required value={form.name} onChange={(value) => updateField("name", value)} placeholder="e.g. Human Resources" error={fieldErrors.name} />
              <Field id="department-code" label="Department code" required value={form.code} onChange={(value) => updateField("code", value)} placeholder="e.g. HR" helper="Stored in uppercase." error={fieldErrors.code} />
              <div>
                <label htmlFor="department-manager" className="mb-2 block text-sm font-semibold text-slate-700">Department manager</label>
                <select id="department-manager" value={form.manager} onChange={(event) => updateField("manager", event.target.value)} aria-invalid={Boolean(fieldErrors.manager)} aria-describedby={fieldErrors.manager ? "department-manager-error" : "department-manager-help"} className={controlClassName}><option value="">Unassigned</option>{employees.map((employee) => <option key={employee.id} value={employee.name}>{employee.name}</option>)}</select>
                {fieldErrors.manager ? <p id="department-manager-error" className="mt-1.5 text-xs font-medium text-red-600">{fieldErrors.manager}</p> : <p id="department-manager-help" className="mt-1.5 text-xs text-slate-500">Select an existing employee as department manager.</p>}
              </div>
              <div>
                <label htmlFor="department-status" className="mb-2 block text-sm font-semibold text-slate-700">Status</label>
                <select id="department-status" value={form.status} onChange={(event) => updateField("status", event.target.value as DepartmentStatus)} aria-invalid={Boolean(fieldErrors.status)} aria-describedby={fieldErrors.status ? "department-status-error" : undefined} className={controlClassName}><option value="Active">Active</option><option value="Inactive">Inactive</option></select>
                {fieldErrors.status && <p id="department-status-error" className="mt-1.5 text-xs font-medium text-red-600">{fieldErrors.status}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="department-description" className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
              <textarea id="department-description" value={form.description} onChange={(event) => updateField("description", event.target.value)} rows={4} placeholder="Describe the department's responsibilities..." aria-invalid={Boolean(fieldErrors.description)} aria-describedby={fieldErrors.description ? "department-description-error" : undefined} className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" />
              {fieldErrors.description && <p id="department-description-error" className="mt-1.5 text-xs font-medium text-red-600">{fieldErrors.description}</p>}
            </div>
          </div>
          <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50/80 p-5 sm:flex-row sm:justify-end sm:px-6">
            <button type="button" onClick={onClose} disabled={saving} className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">Cancel</button>
            <button type="submit" disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">{saving && <Loader2 size={17} className="animate-spin" aria-hidden="true" />}{editing ? "Save changes" : "Create department"}</button>
          </footer>
        </form>
      </div>
    </div>
  );
}

function Field({ id, label, value, onChange, placeholder, helper, error, required = false }: { id: string; label: string; value: string; onChange: (value: string) => void; placeholder: string; helper?: string; error?: string; required?: boolean }) {
  const descriptionId = error ? `${id}-error` : helper ? `${id}-help` : undefined;
  return <div><label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">{label}{required && <><span className="ml-1 text-red-600" aria-hidden="true">*</span><span className="sr-only"> required</span></>}</label><input id={id} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} aria-invalid={Boolean(error)} aria-describedby={descriptionId} className={controlClassName} />{error ? <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : helper && <p id={`${id}-help`} className="mt-1.5 text-xs text-slate-500">{helper}</p>}</div>;
}
