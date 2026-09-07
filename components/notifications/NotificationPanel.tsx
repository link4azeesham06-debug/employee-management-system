"use client";

import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { NotificationTimestamp, NotificationTypeIcon } from "@/components/notifications/NotificationVisuals";
import { Notification } from "@/types/notification";

type Props = {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRemove: (id: string) => void;
};

export default function NotificationPanel({ notifications, unreadCount, onMarkAsRead, onMarkAllAsRead, onRemove }: Props) {
  return (
    <section className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:w-[390px]" aria-labelledby="notification-preview-heading">
      <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Bell size={18} aria-hidden="true" /></span><div className="min-w-0"><h2 id="notification-preview-heading" className="font-bold text-slate-950">Notifications</h2><p className="text-xs text-slate-500">{unreadCount ? `${unreadCount} unread` : "All caught up"}</p></div></div>
        {unreadCount > 0 && <button type="button" onClick={onMarkAllAsRead} className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" aria-label="Mark all notifications as read"><CheckCheck size={14} aria-hidden="true" />Mark all read</button>}
      </header>

      <div className="max-h-[min(420px,calc(100dvh-9rem))] overflow-y-auto">
        {!notifications.length ? <div className="flex flex-col items-center justify-center px-6 py-10 text-center"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><CheckCheck size={23} aria-hidden="true" /></span><p className="mt-4 text-sm font-semibold text-slate-800">You&apos;re all caught up</p><p className="mt-1 text-xs leading-5 text-slate-500">New HR activity will appear here.</p></div> : notifications.map((notification) => (
          <article key={notification.id} className={`relative flex gap-3 border-b border-slate-100 px-4 py-3.5 last:border-0 sm:px-5 ${notification.read ? "bg-white" : "bg-indigo-50/35"}`} aria-label={`${notification.read ? "Read" : "Unread"} ${notification.type} notification: ${notification.title}`}>
            {!notification.read && <span className="absolute left-0 top-0 h-full w-0.5 bg-indigo-500" aria-hidden="true" />}
            <NotificationTypeIcon type={notification.type} compact />
            <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className={`truncate text-sm text-slate-900 ${notification.read ? "font-semibold" : "font-bold"}`}>{notification.title}</p>{!notification.read && <span className="sr-only">Unread</span>}</div><button type="button" onClick={() => onRemove(notification.id)} aria-label={`Delete ${notification.title}`} title="Delete notification" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"><Trash2 size={14} aria-hidden="true" /></button></div>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{notification.message}</p>
              <div className="mt-2 flex items-center justify-between gap-3"><NotificationTimestamp value={notification.createdAt} compact />{!notification.read && <button type="button" onClick={() => onMarkAsRead(notification.id)} className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-2 text-[11px] font-semibold text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" aria-label={`Mark ${notification.title} as read`}><Check size={12} aria-hidden="true" />Mark read</button>}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
