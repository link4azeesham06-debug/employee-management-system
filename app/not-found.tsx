import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[460px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <SearchX size={27} aria-hidden="true" />
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">404</p>
      <h1 className="mt-2 text-xl font-bold text-slate-950">Page not found</h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        The page you requested does not exist or is no longer available.
      </p>
      <Link
        href="/dashboard"
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Return to dashboard
      </Link>
    </div>
  );
}
