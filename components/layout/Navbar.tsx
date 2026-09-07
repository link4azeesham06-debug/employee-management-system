"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Menu,
  Search,
  UserCircle,
} from "lucide-react";

import NotificationPanel from "@/components/notifications/NotificationPanel";
import { useNotifications } from "@/context/NotificationContext";
import { useAuth } from "@/hooks/useAuth";

type NavbarProps = {
  onMenuToggle?: () => void;
};

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  function handleProfile() {
    setShowProfileMenu(false);
    router.push("/profile");
  }

  if (authLoading || !user) return null;

  const displayName =
    user.role === "admin" ? "System Admin" : user.employee?.name ?? "Employee";
  const displayRole =
    user.role === "admin"
      ? "Administrator"
      : user.employee?.position ?? "Employee";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuToggle}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={21} />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl">
            HR Management System
          </h1>
          <div className="mt-1 hidden items-center gap-1.5 text-xs text-slate-500 sm:flex">
            <CalendarDays size={14} aria-hidden="true" />
            <span>{today}</span>
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <label className="ui-control hidden w-64 items-center px-3.5 xl:flex 2xl:w-80">
            <Search size={18} className="shrink-0 text-slate-400" aria-hidden="true" />
            <span className="sr-only">Search</span>
            <input
              type="search"
              placeholder="Search workspace"
              className="ml-2.5 min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowNotifications((current) => !current);
                setShowProfileMenu(false);
              }}
              className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
              aria-expanded={showNotifications}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-indigo-600 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="fixed inset-x-4 top-[5.25rem] z-[100] sm:absolute sm:inset-x-auto sm:right-0 sm:top-14">
                <NotificationPanel
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onRemove={removeNotification}
                />
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowProfileMenu((current) => !current);
                setShowNotifications(false);
              }}
              className="flex h-11 min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:pr-3"
              aria-expanded={showProfileMenu}
            >
              <UserCircle size={30} className="shrink-0 text-indigo-600" />
              <div className="hidden min-w-0 sm:block md:w-32">
                <p className="truncate text-sm font-semibold leading-4 text-slate-900">
                  {displayName}
                </p>
                <p className="mt-0.5 truncate text-[11px] leading-4 text-slate-500">
                  {displayRole}
                </p>
              </div>
              <ChevronDown
                size={15}
                className={`hidden shrink-0 text-slate-400 transition sm:block ${
                  showProfileMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {showProfileMenu && (
              <div className="ui-floating-surface absolute right-0 top-14 z-[100] w-52 overflow-hidden py-1.5">
                <div className="border-b border-slate-100 px-4 py-2.5 sm:hidden">
                  <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                  <p className="truncate text-xs text-slate-500">{displayRole}</p>
                </div>
                <button
                  type="button"
                  onClick={handleProfile}
                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  My Profile
                </button>
                <div className="mx-3 border-t border-slate-100" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
