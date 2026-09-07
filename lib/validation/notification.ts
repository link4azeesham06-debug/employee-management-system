import { z } from "zod";

export const notificationTypeSchema = z.enum(
  ["success", "warning", "info", "error"],
  { error: "Select a valid notification type." },
);

export const notificationCreateSchema = z.object({
  title: z.string().trim().min(1, "Notification title is required.").max(120, "Notification title must be 120 characters or fewer."),
  message: z.string().trim().min(1, "Notification message is required.").max(500, "Notification message must be 500 characters or fewer."),
  type: notificationTypeSchema,
  read: z.boolean().default(false),
  link: z.string().trim().max(256, "Notification link must be 256 characters or fewer.").optional(),
});

export type NotificationCreateInput = z.output<typeof notificationCreateSchema>;
