import { apiClient } from "../lib/apiClient";
import { GetNotificationsParams, GetUnreadNotificationCountParams, MarkAllNotificationsReadParams, MarkAllNotificationsReadResponse, MarkNotificationReadParams, MarkNotificationReadResponse, NotificationResponse, UnreadNotificationCountResponse } from "../types/notification.type";

export const getNotifications = async (
  params: GetNotificationsParams,
): Promise<NotificationResponse> => {
  const response = await apiClient.get<NotificationResponse>(
    "/app-api/v1/notifications",
    {
      params: {
        user_id: params.user_id,
        visitor_id: params.visitor_id,
        page: params.page ?? 1,
      },
    },
  );

  return response.data;
};


export const markNotificationAsRead = async (
  params: MarkNotificationReadParams,
): Promise<MarkNotificationReadResponse> => {
  const response = await apiClient.post<MarkNotificationReadResponse>(
    `/app-api/v1/notifications/${params.notificationId}/read`,
    {
      user_id: params.user_id,
      visitor_id: params.visitor_id,
    },
  );

  return response.data;
};

export const getUnreadNotificationCount = async (
  params: GetUnreadNotificationCountParams,
): Promise<UnreadNotificationCountResponse> => {
  const response =
    await apiClient.get<UnreadNotificationCountResponse>(
      "/app-api/v1/notifications/unread-count",
      {
        params: {
          user_id: params.user_id,
          visitor_id: params.visitor_id,
          page: params.page ?? 1,
        },
      },
    );

  return response.data;
}


export const markAllNotificationsAsRead = async (
  params: MarkAllNotificationsReadParams,
): Promise<MarkAllNotificationsReadResponse> => {
  const response =
    await apiClient.post<MarkAllNotificationsReadResponse>(
      "/app-api/v1/notifications/read-all",
      {
        user_id: params.user_id,
        visitor_id: params.visitor_id,
      },
    );

  return response.data;
};