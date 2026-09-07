export type NotificationType =
  | "success"
  | "warning"
  | "info"
  | "error";

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  link?: string;
};