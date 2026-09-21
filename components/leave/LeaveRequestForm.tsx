"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CalendarDays, X } from "lucide-react";

import {
  leaveRequestCreateSchema,
  type LeaveRequestCreateInput,
} from "@/lib/validation/leave";
import { normalizeValidationError } from "@/lib/validation/errors";
import { LEAVE_TYPES } from "@/types/leave";

type LeaveRequestFormProps = {
  onClose: () => void;
  onSubmit: (request: LeaveRequestCreateInput) => Promise<void>;
};

const initialValues: LeaveRequestCreateInput = {
  leaveType: "Annual",
  startDate: "",
  endDate: "",
  reason: "",
};

export default function LeaveRequestForm({
  onClose,
  onSubmit,
}: LeaveRequestFormProps) {
  const [values, setValues] = useState<LeaveRequestCreateInput>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const submittingRef = useRef(submitting);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submittingRef.current) {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
      );

      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose]);

  function updateField<Key extends keyof LeaveRequestCreateInput>(
    field: Key,
    value: LeaveRequestCreateInput[Key],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = leaveRequestCreateSchema.safeParse(values);

    if (!result.success) {
      setFieldErrors(normalizeValidationError(result.error).fieldErrors);
      return;
    }

    try {
      submittingRef.current = true;
      setSubmitting(true);
      await onSubmit(result.data);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={submitting ? undefined : onClose}
        aria-label="Close leave request form"
      />

      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-request-title"
        aria-describedby="leave-request-description"
        className="relative z-10 max-h-[95dvh] w-full overflow-y-auto rounded-t-2xl border border-slate-200 bg-white shadow-2xl outline-none sm:max-w-xl sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <CalendarDays size={20} aria-hidden="true" />
            </span>
            <div>
              <h2 id="leave-request-title" className="text-lg font-bold text-slate-950">
                Request leave
              </h2>
              <p id="leave-request-description" className="mt-1 text-sm leading-5 text-slate-500">
                Submit the dates and reason for administrator review.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Close"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-5 px-5 py-6 sm:px-6">
            <Field label="Leave type" error={fieldErrors.leaveType} htmlFor="leave-type">
              <select
                id="leave-type"
                value={values.leaveType}
                onChange={(event) => updateField("leaveType", event.target.value as LeaveRequestCreateInput["leaveType"])}
                className={inputClass(Boolean(fieldErrors.leaveType))}
                aria-invalid={Boolean(fieldErrors.leaveType)}
              >
                {LEAVE_TYPES.map((type) => <option key={type}>{type}</option>)}
              </select>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Start date" error={fieldErrors.startDate} htmlFor="leave-start-date">
                <input
                  id="leave-start-date"
                  type="date"
                  value={values.startDate}
                  onChange={(event) => updateField("startDate", event.target.value)}
                  className={inputClass(Boolean(fieldErrors.startDate))}
                  aria-invalid={Boolean(fieldErrors.startDate)}
                />
              </Field>
              <Field label="End date" error={fieldErrors.endDate} htmlFor="leave-end-date">
                <input
                  id="leave-end-date"
                  type="date"
                  value={values.endDate}
                  onChange={(event) => updateField("endDate", event.target.value)}
                  className={inputClass(Boolean(fieldErrors.endDate))}
                  aria-invalid={Boolean(fieldErrors.endDate)}
                />
              </Field>
            </div>

            <Field label="Reason" error={fieldErrors.reason} htmlFor="leave-reason">
              <textarea
                id="leave-reason"
                rows={4}
                value={values.reason}
                onChange={(event) => updateField("reason", event.target.value)}
                placeholder="Briefly explain the reason for your request"
                className={`${inputClass(Boolean(fieldErrors.reason))} min-h-28 resize-y py-3`}
                aria-invalid={Boolean(fieldErrors.reason)}
              />
            </Field>
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              {submitting ? "Submitting…" : "Submit request"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

function inputClass(invalid: boolean): string {
  return `h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:ring-4 ${
    invalid
      ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
      : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10"
  }`;
}
