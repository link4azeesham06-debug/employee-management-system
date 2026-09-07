"use client";

import { Bell, Check, CheckCheck, Inbox, RefreshCw, Trash2 } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { NotificationTimestamp, NotificationTypeIcon } from "@/components/notifications/NotificationVisuals";
import { useNotifications } from "@/context/NotificationContext";
import { Notification } from "@/types/notification";

export default function NotificationsPage() {
  return <ProtectedRoute><NotificationsContent /></ProtectedRoute>;
}

function NotificationsContent() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, removeNotification, refreshNotifications } = useNotifications();
  if (loading) return <NotificationLoadingSkeleton />;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">Inbox</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Notifications</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Review important HR activity and keep track of items that need your attention.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button type="button" onClick={refreshNotifications} className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" aria-label="Refresh notifications"><RefreshCw size={17} aria-hidden="true" />Refresh</button>
          {unreadCount > 0 && <button type="button" onClick={markAllAsRead} className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"><CheckCheck size={17} aria-hidden="true" />Mark all read</button>}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:max-w-xl" aria-label="Notification summary">
        <SummaryCard label="Total notifications" value={notifications.length} icon={<Bell size={18} />} tone="indigo" />
        <SummaryCard label="Unread" value={unreadCount} icon={<Inbox size={18} />} tone={unreadCount ? "amber" : "slate"} />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="notification-center-heading">
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6"><div><h2 id="notification-center-heading" className="text-base font-bold text-slate-950 sm:text-lg">Notification center</h2><p className="mt-1 text-sm text-slate-500">Newest activity appears first.</p></div>{unreadCount > 0 && <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />{unreadCount} unread</span>}</header>
        {!notifications.length ? <EmptyState /> : <div className="divide-y divide-slate-100">{notifications.map((notification) => <NotificationRow key={notification.id} notification={notification} onMarkAsRead={markAsRead} onRemove={removeNotification} />)}</div>}
      </section>
    </div>
  );
}

function NotificationRow({ notification, onMarkAsRead, onRemove }: { notification: Notification; onMarkAsRead: (id: string) => void; onRemove: (id: string) => void }) {
  return (
    <article className={`relative flex gap-3.5 px-4 py-5 transition hover:bg-slate-50/70 sm:gap-4 sm:px-6 ${notification.read ? "bg-white" : "bg-indigo-50/35"}`} aria-label={`${notification.read ? "Read" : "Unread"} ${notification.type} notification: ${notification.title}`}>
      {!notification.read && <span className="absolute left-0 top-0 h-full w-0.5 bg-indigo-500" aria-hidden="true" />}
      <NotificationTypeIcon type={notification.type} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className={`text-sm text-slate-950 ${notification.read ? "font-semibold" : "font-bold"}`}>{notification.title}</h3>{!notification.read && <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-700"><span className="h-1.5 w-1.5 rounded-full bg-indigo-600" aria-hidden="true" />Unread</span>}</div><p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-600">{notification.message}</p></div>
          <NotificationTimestamp value={notification.createdAt} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {!notification.read && <button type="button" onClick={() => onMarkAsRead(notification.id)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" aria-label={`Mark ${notification.title} as read`}><Check size={14} aria-hidden="true" />Mark as read</button>}
          <button type="button" onClick={() => onRemove(notification.id)} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500" aria-label={`Delete ${notification.title}`}><Trash2 size={14} aria-hidden="true" />Delete</button>
        </div>
      </div>
    </article>
  );
}

function SummaryCard({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: "indigo" | "amber" | "slate" }) {
  const tones = { indigo: "bg-indigo-50 text-indigo-600", amber: "bg-amber-50 text-amber-600", slate: "bg-slate-100 text-slate-500" };
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-start justify-between gap-2"><div><p className="text-xs font-medium leading-5 text-slate-500 sm:text-sm">{label}</p><p className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{value}</p></div><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`} aria-hidden="true">{icon}</span></div></article>;
}

function EmptyState() {
  return <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><CheckCheck size={26} aria-hidden="true" /></div><h2 className="mt-5 text-lg font-bold text-slate-950">You&apos;re all caught up</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">There are no notifications right now. New HR activity will appear here automatically.</p></div>;
}

function NotificationLoadingSkeleton() {
  return <div className="space-y-6 animate-pulse" role="status" aria-label="Loading notifications"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="h-8 w-48 rounded-lg bg-slate-200" /><div className="mt-3 h-4 w-80 max-w-full rounded bg-slate-200" /></div><div className="h-11 w-32 rounded-xl bg-slate-200" /></div><div className="grid grid-cols-2 gap-3 sm:max-w-xl"><div className="h-28 rounded-2xl bg-white" /><div className="h-28 rounded-2xl bg-white" /></div><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="h-20 border-b border-slate-100 bg-slate-50/50" />{Array.from({ length: 5 }, (_, index) => <div key={index} className="flex gap-4 border-b border-slate-100 p-5"><div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200" /><div className="flex-1"><div className="h-4 w-40 rounded bg-slate-200" /><div className="mt-2 h-3 w-3/4 rounded bg-slate-100" /></div></div>)}</div><span className="sr-only">Loading notification activity</span></div>;
}
