"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

import BrandLogo from "@/components/brand/BrandLogo";
const links = [
  { label: "Product", href: "#product" },
  { label: "Workflow", href: "#workflow" },
  { label: "Security", href: "#security" },
  { label: "Insights", href: "#insights" },
];

export default function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/75 bg-white/85 backdrop-blur-xl">
      <nav className="relative mx-auto flex h-[4.5rem] max-w-[90rem] items-center px-4 sm:px-6 lg:px-8" aria-label="Public navigation">
        <Link href="/" className="inline-flex items-center" aria-label="HR home">
          <BrandLogo markSize={40} decorative />
        </Link>

        <ul className="ml-auto hidden items-center gap-7 text-sm font-semibold text-slate-600 lg:flex">
          {links.map((link) => <li key={link.href}><Link className="rounded-md transition hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" href={link.href}>{link.label}</Link></li>)}
        </ul>

        <div className="ml-7 hidden items-center gap-2 lg:flex">
          <Link href="/login" className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">Sign in</Link>
          <Link href="/login" className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">Explore HR <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>

        <button type="button" onClick={() => setMenuOpen((current) => !current)} className="ml-auto flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 lg:hidden" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="public-mobile-menu">
          {menuOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
        </button>

        {menuOpen && (
          <div id="public-mobile-menu" className="absolute inset-x-4 top-[4.9rem] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl sm:inset-x-6 lg:hidden">
            <div className="grid gap-1 text-sm font-semibold text-slate-700">
              {links.map((link) => <Link key={link.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 hover:bg-slate-50" href={link.href}>{link.label}</Link>)}
              <Link onClick={() => setMenuOpen(false)} className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-white hover:bg-indigo-700" href="/login">Explore HR <ArrowRight size={15} aria-hidden="true" /></Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
