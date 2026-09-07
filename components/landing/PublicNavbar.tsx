"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, ShieldCheck, X } from "lucide-react";

const links = [
  { label: "Features", href: "#features" },
  { label: "Security", href: "#security" },
  { label: "Analytics", href: "#analytics" },
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
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <nav className="relative mx-auto flex h-18 max-w-7xl items-center px-4 sm:px-6 lg:px-8" aria-label="Public navigation">
        <Link href="/" className="inline-flex items-center gap-2.5 font-bold tracking-tight text-slate-950" aria-label="HR Pro home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/25"><ShieldCheck size={21} aria-hidden="true" /></span>
          <span>HR Pro</span>
        </Link>

        <ul className="ml-auto hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
          {links.map((link) => <li key={link.href}><Link className="transition hover:text-indigo-600" href={link.href}>{link.label}</Link></li>)}
        </ul>

        <div className="ml-7 hidden items-center gap-2 md:flex">
          <Link href="/login" className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">Sign in</Link>
          <Link href="/login" className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">Try demo <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>

        <button type="button" onClick={() => setMenuOpen((current) => !current)} className="ml-auto flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 md:hidden" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="public-mobile-menu">
          {menuOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
        </button>

        {menuOpen && (
          <div id="public-mobile-menu" className="absolute inset-x-4 top-[4.75rem] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl sm:inset-x-6 md:hidden">
            <div className="grid gap-1 text-sm font-semibold text-slate-700">
              {links.map((link) => <Link key={link.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 hover:bg-slate-50" href={link.href}>{link.label}</Link>)}
              <Link onClick={() => setMenuOpen(false)} className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 text-white hover:bg-indigo-700" href="/login">Try the demo</Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
