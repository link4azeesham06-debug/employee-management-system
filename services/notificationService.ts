import { supabase } from "@/lib/supabase/client";
import { AppError } from "@/lib/errors/AppError";
import { normalizeError } from "@/lib/errors/normalizeError";
import { parseValidated } from "@/lib/validation/errors";
import {
  notificationCreateSchema,
  type NotificationCreateInput,
} from "@/lib/validation/notification";
import type { Notification, NotificationType } from "@/types/notification";

type NotificationRow = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link: string | null;
  created_at: string;
};

const NOTIFICATION_SELECT =
  "id, user_id, title, message, type, read, link, created_at";

function normalizeType(type: string): NotificationType {
  if (type === "success" || type === "warning" || type === "error") {
    return type;
  }

  return "info";
}

function mapNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    type: normalizeType(row.type),
    read: row.read,
    createdAt: row.created_at,
    link: row.link ?? undefined,
  };
}

function notificationError(error: { code?: string; message: string }): AppError {
  return normalizeError(error, {
    fallbackCode: "DATABASE",
    fallbackMessage: "Unable to update notifications.",
    messages: {
      FORBIDDEN: "You do not have permission to manage this notification.",
      DATABASE: "Unable to update notifications.",
    },
    metadata: { domain: "notification" },
  });
}

async function getAuthenticatedUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw normalizeError(error, {
      fallbackCode: "AUTH",
      fallbackMessage: "Unable to verify your notification session.",
      metadata: { domain: "notification", action: "get-user" },
    });
  }
  if (!user) {
    throw new AppError("UNAUTHORIZED", "Please sign in to access notifications.", {
      metadata: { domain: "notification" },
    });
  }

  return user.id;
}

export async function getNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select(NOTIFICATION_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw notificationError(error);
  return ((data ?? []) as NotificationRow[]).map(mapNotification);
}

export async function createNotification(
  data: NotificationCreateInput,
): Promise<Notification> {
  const validated = parseValidated(notificationCreateSchema, data);
  const userId = await getAuthenticatedUserId();
  const { data: created, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      title: validated.title,
      message: validated.message,
      type: validated.type,
      read: validated.read,
      link: validated.link ?? null,
      created_at: new Date().toISOString(),
    })
    .select(NOTIFICATION_SELECT)
    .single();

  if (error) throw notificationError(error);
  return mapNotification(created as NotificationRow);
}

export async function markNotificationAsRead(id: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .select("id");

  if (error) throw notificationError(error);
  if (!data?.length) {
    throw new AppError("NOT_FOUND", "Notification was not found or does not belong to you.", {
      metadata: { domain: "notification", action: "mark-read" },
    });
  }

  return getNotifications();
}

export async function markAllNotificationsAsRead(): Promise<Notification[]> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("read", false);

  if (error) throw notificationError(error);
  return getNotifications();
}

export async function deleteNotification(id: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) throw notificationError(error);
  if (!data?.length) {
    throw new AppError("NOT_FOUND", "Notification was not found or does not belong to you.", {
      metadata: { domain: "notification", action: "delete" },
    });
  }

  return getNotifications();
}
