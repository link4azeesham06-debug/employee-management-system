"use client";

import { ReactNode, useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

type Props = { children: ReactNode; onClose: () => void; title?: string; description?: string };

export default function EmployeeModal({ children, onClose, title = "Employee information", description = "Add or update employee details." }: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), [href]'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-[2px] sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl outline-none sm:max-h-[calc(100dvh-3rem)]">
        <header className="flex shrink-0 items-start justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div><h2 id={titleId} className="text-lg font-bold text-slate-950">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div>
          <button type="button" onClick={onClose} aria-label="Close employee modal" className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><X size={19} aria-hidden="true" /></button>
        </header>
        <div className="overflow-y-auto p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
