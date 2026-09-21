"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Settings,
  UserCircle,
  Users,
  X,
} from "lucide-react";

import BrandLogo from "@/components/brand/BrandLogo";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";

type SidebarProps = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

export default function Sidebar({
  mobileOpen = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { canViewReports, canManageDepartments, canViewLeave } = usePermissions();
  const isAdmin = user?.role === "admin";

  if (loading || !user) return null;

  const menuItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, visible: true },
    { title: "Employees", href: "/employees", icon: Users, visible: true },
    {
      title: "Leave Management",
      href: "/leave",
      icon: CalendarDays,
      visible: canViewLeave,
    },
    {
      title: "Departments",
      href: "/departments",
      icon: Building2,
      visible: canManageDepartments,
    },
    {
      title: "Reports",
      href: "/reports",
      icon: BarChart3,
      visible: canViewReports,
    },
    {
      title: "Audit Logs",
      href: "/audit",
      icon: ClipboardList,
      visible: isAdmin,
    },
    { title: "Notifications", href: "/notifications", icon: Bell, visible: true },
    { title: "Profile", href: "/profile", icon: UserCircle, visible: true },
    { title: "Settings", href: "/settings", icon: Settings, visible: isAdmin },
  ];

  const visibleMenuItems = menuItems.filter((item) => item.visible);
  const displayName = user.employee?.name || (isAdmin ? "System Admin" : "Employee");
  const displayRole = isAdmin ? "Administrator" : "Employee";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[60] bg-slate-950/45 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-[70] h-dvh w-[min(18rem,calc(100vw-2rem))] shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-white shadow-2xl shadow-slate-950/20 lg:sticky lg:top-0 lg:z-40 lg:flex lg:w-64 lg:translate-x-0 lg:shadow-none ${
          mobileOpen ? "flex translate-x-0" : "hidden -translate-x-full"
        }`}
        aria-label="Primary navigation"
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex h-20 shrink-0 items-center gap-3 border-b border-white/10 px-5">
            <BrandLogo
              variant="inverse"
              showDescriptor
              markSize={40}
              className="min-w-0 flex-1"
              markClassName="text-indigo-500 shadow-sm shadow-indigo-950/30"
            />

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Close navigation"
            >
              <X size={19} />
            </button>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-6">
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Workspace
            </p>

            <div className="space-y-1.5">
              {visibleMenuItems.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={`group flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-950/25"
                        : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
                    }`}
                  >
                    <Icon
                      size={19}
                      className={
                        active
                          ? "text-white"
                          : "text-slate-400 group-hover:text-slate-200"
                      }
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate">{item.title}</span>
                    <ChevronRight
                      size={15}
                      className={`transition ${
                        active ? "opacity-80" : "opacity-0 group-hover:opacity-70"
                      }`}
                      aria-hidden="true"
                    />
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        <div className="shrink-0 border-t border-white/10 p-3">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-sm font-bold text-indigo-200 ring-1 ring-inset ring-indigo-400/20">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                <p className="truncate text-xs text-slate-400">{displayRole}</p>
              </div>
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10"
                role="status"
                aria-label="System online"
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
