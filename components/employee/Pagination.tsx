"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = { currentPage: number; totalPages: number; onPageChange: (page: number) => void };

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-between border-t border-slate-200 px-4 py-3 sm:px-5" aria-label="Employee directory pagination">
      <p className="text-sm text-slate-500">Page <span className="font-semibold text-slate-800">{currentPage}</span> of {totalPages}</p>
      <div className="flex items-center gap-1.5">
        <button type="button" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} aria-label="Go to previous page" className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><ChevronLeft size={16} aria-hidden="true" /><span className="hidden sm:inline">Previous</span></button>
        <div className="hidden items-center gap-1 sm:flex">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button type="button" key={page} onClick={() => onPageChange(page)} aria-label={`Go to page ${page}`} aria-current={currentPage === page ? "page" : undefined} className={`h-9 min-w-9 rounded-lg px-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${currentPage === page ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{page}</button>
          ))}
        </div>
        <button type="button" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} aria-label="Go to next page" className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><span className="hidden sm:inline">Next</span><ChevronRight size={16} aria-hidden="true" /></button>
      </div>
    </nav>
  );
}
