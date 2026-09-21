"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { reportError } from "@/lib/errors/reportError";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    reportError(error, { scope: "AppErrorBoundary", force: true });
  }, [error]);

  return (
    <div className="flex min-h-[460px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <AlertTriangle size={27} aria-hidden="true" />
      </div>
      <h1 className="mt-5 text-xl font-bold text-slate-950">This page could not be loaded</h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        Something unexpected happened. Try loading this page again.
      </p>
      <button
        type="button"
        onClick={unstable_retry}
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      >
        <RefreshCw size={16} aria-hidden="true" />
        Try again
      </button>
    </div>
  );
}
