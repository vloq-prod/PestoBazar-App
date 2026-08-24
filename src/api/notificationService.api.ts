import { apiClient } from "../lib/apiClient";
import { GetNotificationsParams, GetUnreadNotificationCountParams, MarkAllNotificationsReadParams, MarkAllNotificationsReadResponse, MarkNotificationReadParams, MarkNotificationReadResponse, NotificationResponse, UnreadNotificationCountResponse } from "../types/notification.type";

export const getNotifications = async (
  params: GetNotificationsParams,
): Promise<NotificationResponse> => {
  const queryParams = {
    user_id: params.user_id,
    visitor_id: params.visitor_id,
    page: params.page ?? 1,
  };
  console.log("[getNotifications] Endpoint: GET /app-api/v1/notifications");
  console.log("[getNotifications] Query Params Payload:", JSON.stringify(queryParams, null, 2));

  const response = await apiClient.get<NotificationResponse>(
    "/app-api/v1/notifications",
    {
      params: queryParams,
    },
  );

  console.log("[getNotifications] Response Data:", JSON.stringify(response.data, null, 2));
  return response.data;
};


export const markNotificationAsRead = async (
  params: MarkNotificationReadParams,
): Promise<MarkNotificationReadResponse> => {
  const payload = {
    user_id: params.user_id,
    visitor_id: params.visitor_id,
  };
  console.log(`[markNotificationAsRead] Endpoint: POST /app-api/v1/notifications/${params.notificationId}/read`);
  console.log("[markNotificationAsRead] Request Payload:", JSON.stringify(payload, null, 2));

  const response = await apiClient.post<MarkNotificationReadResponse>(
    `/app-api/v1/notifications/${params.notificationId}/read`,
    payload,
  );

  console.log("[markNotificationAsRead] Response Data:", JSON.stringify(response.data, null, 2));
  return response.data;
};

export const getUnreadNotificationCount = async (
  params: GetUnreadNotificationCountParams,
): Promise<UnreadNotificationCountResponse> => {
  const queryParams = {
    user_id: params.user_id,
    visitor_id: params.visitor_id,
    page: params.page ?? 1,
  };
  console.log("[getUnreadNotificationCount] Endpoint: GET /app-api/v1/notifications/unread-count");
  console.log("[getUnreadNotificationCount] Query Params Payload:", JSON.stringify(queryParams, null, 2));

  const response =
    await apiClient.get<UnreadNotificationCountResponse>(
      "/app-api/v1/notifications/unread-count",
      {
        params: queryParams,
      },
    );

  console.log("[getUnreadNotificationCount] Response Data:", JSON.stringify(response.data, null, 2));
  return response.data;
}


export const markAllNotificationsAsRead = async (
  params: MarkAllNotificationsReadParams,
): Promise<MarkAllNotificationsReadResponse> => {
  const payload = {
    user_id: params.user_id,
    visitor_id: params.visitor_id,
  };
  console.log("[markAllNotificationsAsRead] Endpoint: /app-api/v1/notifications/read-all");
  console.log("[markAllNotificationsAsRead] Request Payload:", JSON.stringify(payload, null, 2));

  const response =
    await apiClient.post<MarkAllNotificationsReadResponse>(
      "/app-api/v1/notifications/read-all",
      payload,
    );

  console.log("[markAllNotificationsAsRead] Response Data:", JSON.stringify(response.data, null, 2));
  return response.data;
};