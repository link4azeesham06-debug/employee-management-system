"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";

import { getUserErrorMessage } from "@/lib/errors/normalizeError";
import { reportError } from "@/lib/errors/reportError";
import { useAuth } from "@/hooks/useAuth";
import {
  createNotification,
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/services/notificationService";
import type { Notification, NotificationType } from "@/types/notification";

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  addNotification: (
    title: string,
    message: string,
    type?: NotificationType,
    link?: string,
  ) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

function showNotificationError(error: unknown): void {
  reportError(error, { scope: "NotificationContext" });
  toast.error(getUserErrorMessage(error, "Unable to update notifications."));
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const refreshNotifications = useCallback(async () => {
    try {
      setLoading(true);

      if (!user) {
        setNotifications([]);
        return;
      }

      setNotifications(await getNotifications());
    } catch (error) {
      setNotifications([]);
      showNotificationError(error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshNotifications();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshNotifications]);

  const addNotification = useCallback(
    async (
      title: string,
      message: string,
      type: NotificationType = "info",
      link?: string,
    ) => {
      try {
        const notification = await createNotification({
          title,
          message,
          type,
          read: false,
          link,
        });

        setNotifications((current) => [notification, ...current]);
      } catch (error) {
        showNotificationError(error);
      }
    },
    [],
  );

  const markAsRead = useCallback(async (id: string) => {
    try {
      setNotifications(await markNotificationAsRead(id));
    } catch (error) {
      showNotificationError(error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      setNotifications(await markAllNotificationsAsRead());
    } catch (error) {
      showNotificationError(error);
    }
  }, []);

  const removeNotification = useCallback(async (id: string) => {
    try {
      setNotifications(await deleteNotification(id));
    } catch (error) {
      showNotificationError(error);
    }
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotifications must be used inside NotificationProvider");
  }

  return context;
}
