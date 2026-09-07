"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import {
  employeeCreateSchema,
  employeeUpdateSchema,
  type EmployeeCreateInput,
} from "@/lib/validation/employee";
import {
  normalizeValidationError,
  type ValidationFieldErrors,
} from "@/lib/validation/errors";
import type { Employee } from "@/types/employee";

type Props = {
  addEmployee?: (employee: EmployeeCreateInput) => void;
  updateEmployee: (employee: Employee) => void;
  editingEmployee: Employee | null;
  onCancel?: () => void;
};

const fieldClassName = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

export default function EmployeeForm({ addEmployee, updateEmployee, editingEmployee, onCancel }: Props) {
  const [name, setName] = useState(editingEmployee?.name ?? "");
  const [email, setEmail] = useState(editingEmployee?.email ?? "");
  const [position, setPosition] = useState(editingEmployee?.position ?? "");
  const [department, setDepartment] = useState(editingEmployee?.department ?? "");
  const [status, setStatus] = useState<Employee["status"]>(editingEmployee?.status ?? "Active");
  const [validationError, setValidationError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ValidationFieldErrors>({});

  function clearFieldError(field: string) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    if (validationError) setValidationError("");
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const commonFields = { name, email, position, department, status };
    const result = editingEmployee
      ? employeeUpdateSchema.safeParse({ ...editingEmployee, ...commonFields })
      : employeeCreateSchema.safeParse({
          employeeId: `EMP-${Date.now().toString().slice(-6)}`,
          ...commonFields,
          joinedDate: new Date().toISOString().split("T")[0],
        });

    if (!result.success) {
      const normalized = normalizeValidationError(result.error);
      setValidationError(normalized.message);
      setFieldErrors(normalized.fieldErrors);
      return;
    }

    setValidationError("");
    setFieldErrors({});
    if (editingEmployee) {
      updateEmployee(result.data as Employee);
    } else if (addEmployee) {
      addEmployee(result.data as EmployeeCreateInput);
    }
    setName(""); setEmail(""); setPosition(""); setDepartment(""); setStatus("Active");
  };

  const fields = [
    { id: "employee-name", key: "name", label: "Full name", type: "text", placeholder: "Enter employee name", value: name, change: setName },
    { id: "employee-email", key: "email", label: "Email address", type: "email", placeholder: "name@company.com", value: email, change: setEmail },
    { id: "employee-position", key: "position", label: "Position", type: "text", placeholder: "e.g. Product Designer", value: position, change: setPosition },
    { id: "employee-department", key: "department", label: "Department", type: "text", placeholder: "e.g. Product", value: department, change: setDepartment },
  ];

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {validationError && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-medium text-red-700"><AlertCircle className="mt-0.5 shrink-0" size={17} aria-hidden="true" />{validationError}</div>}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {fields.map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id} className="mb-2 block text-sm font-semibold text-slate-700">{field.label} <span className="text-red-600" aria-hidden="true">*</span><span className="sr-only">required</span></label>
            <input id={field.id} type={field.type} required value={field.value} onChange={(event) => { field.change(event.target.value); clearFieldError(field.key); }} placeholder={field.placeholder} aria-invalid={Boolean(fieldErrors[field.key])} aria-describedby={fieldErrors[field.key] ? `${field.id}-error` : undefined} className={fieldClassName} />
            {fieldErrors[field.key] && <p id={`${field.id}-error`} className="mt-1.5 text-xs font-medium text-red-600">{fieldErrors[field.key]}</p>}
          </div>
        ))}
        <div>
          <label htmlFor="employee-status" className="mb-2 block text-sm font-semibold text-slate-700">Employment status</label>
          <select id="employee-status" value={status} onChange={(event) => { setStatus(event.target.value as Employee["status"]); clearFieldError("status"); }} aria-invalid={Boolean(fieldErrors.status)} aria-describedby={fieldErrors.status ? "employee-status-error" : undefined} className={fieldClassName}>
            <option value="Active">Active</option><option value="On Leave">On Leave</option><option value="Inactive">Inactive</option>
          </select>
          {fieldErrors.status && <p id="employee-status-error" className="mt-1.5 text-xs font-medium text-red-600">{fieldErrors.status}</p>}
        </div>
      </div>
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">Cancel</button>
        <button type="submit" className="h-11 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">{editingEmployee ? "Update employee" : "Save employee"}</button>
      </div>
    </form>
  );
}
