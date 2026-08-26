import { authedJson } from "@/lib/auth/client";

/**
 * The customer's in-app notification inbox (the header bell). Rows are written server-side for
 * every update about their actions — order paid/status, refund, repair, sell and support-ticket
 * updates — and read here. `type` is a plain backend string (may be null on older rows).
 */

export type NotificationItem = {
  id: string;
  userId?: string | null;
  title: string;
  body: string;
  type?: string | null;
  read: boolean;
  createdAt?: string | null;
};

export function listNotifications(): Promise<NotificationItem[]> {
  return authedJson<NotificationItem[]>(`/api/v1/notifications/history`);
}

export function fetchUnreadCount(): Promise<number> {
  return authedJson<number>(`/api/v1/notifications/unread-count`);
}

export function markNotificationRead(id: string): Promise<null> {
  return authedJson<null>(`/api/v1/notifications/history/${id}/read`, { method: "PUT" });
}

export function markAllNotificationsRead(): Promise<number> {
  return authedJson<number>(`/api/v1/notifications/history/read-all`, { method: "PUT" });
}

/** Where a notification points. Types the bell can't route just mark themselves read. */
export function notificationRoute(type: string | null | undefined): string | null {
  switch (type) {
    case "ORDER_STATUS":
    case "REFUND_UPDATE":
    // A payment that stalled — the message exists to get them back to the order's
    // "complete payment" buttons, so an unroutable notification would defeat it.
    case "PAYMENT_HELP":
      return "/account#orders";
    case "REPAIR_UPDATE":
      return "/repair/my";
    case "SELL_UPDATE":
      return "/sell/my";
    case "SUPPORT_UPDATE":
      return "/support/my";
    case "PROMO":
      return "/products";
    default:
      return null;
  }
}
