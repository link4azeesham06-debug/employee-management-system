"use client";

import { useEffect } from "react";

import "./globals.css";
import { logAppError } from "@/lib/errors/normalizeError";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    logAppError("GlobalErrorBoundary", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-950">
        <title>Application error | HR Pro</title>
        <main className="flex min-h-screen items-center justify-center p-6">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-bold">HR Pro could not start</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              An unexpected application error occurred. Try loading the workspace again.
            </p>
            <button
              type="button"
              onClick={unstable_retry}
              className="mt-5 h-11 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
