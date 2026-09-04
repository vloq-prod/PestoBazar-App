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

  const response = await apiClient.get<NotificationResponse>(
    "/app-api/v1/notifications",
    {
      params: queryParams,
    },
  );

  return response.data;
};


export const markNotificationAsRead = async (
  params: MarkNotificationReadParams,
): Promise<MarkNotificationReadResponse> => {
  const payload = {
    user_id: params.user_id,
    visitor_id: params.visitor_id,
  };

  const response = await apiClient.post<MarkNotificationReadResponse>(
    `/app-api/v1/notifications/${params.notificationId}/read`,
    payload,
  );

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

  const response =
    await apiClient.get<UnreadNotificationCountResponse>(
      "/app-api/v1/notifications/unread-count",
      {
        params: queryParams,
      },
    );

  return response.data;
}


export const markAllNotificationsAsRead = async (
  params: MarkAllNotificationsReadParams,
): Promise<MarkAllNotificationsReadResponse> => {
  const payload = {
    user_id: params.user_id,
    visitor_id: params.visitor_id,
  };

  const response =
    await apiClient.post<MarkAllNotificationsReadResponse>(
      "/app-api/v1/notifications/read-all",
      payload,
    );

  return response.data;
};