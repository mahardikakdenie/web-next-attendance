import { secureRequest } from "@/lib/axios";
import { NotificationListResponse } from "@/types/api";

export const getNotifications = async (limit: number = 20) => {
  return secureRequest<NotificationListResponse>("get", "/v1/notifications", { limit });
};

export const markAsRead = async (id: number) => {
  return secureRequest<{ success: boolean }>("patch", `/v1/notifications/${id}/read`);
};

export const markAllAsRead = async () => {
  return secureRequest<{ success: boolean }>("patch", "/v1/notifications/read-all");
};
