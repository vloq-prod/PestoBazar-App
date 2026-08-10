import { useMutation, useQuery } from "@tanstack/react-query";
import {
  GetNotificationsParams,
  GetUnreadNotificationCountParams,
  MarkAllNotificationsReadParams,
  MarkNotificationReadParams,
} from "../types/notification.type";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../api/notificationService.api";

export const useNotifications = (params: GetNotificationsParams) => {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => getNotifications(params),
    staleTime: 30 * 1000,
  });
};

export const useMarkNotificationAsRead = () => {
  return useMutation({
    mutationFn: (params: MarkNotificationReadParams) =>
      markNotificationAsRead(params),
  });
};

export const useUnreadNotificationCount = (
  params: GetUnreadNotificationCountParams,
) => {
  return useQuery({
    queryKey: ["notifications", "unread-count", params],
    queryFn: () => getUnreadNotificationCount(params),
    staleTime: 30 * 1000,
  });
};

export const useMarkAllNotificationsAsRead = () => {
  return useMutation({
    mutationFn: (params: MarkAllNotificationsReadParams) =>
      markAllNotificationsAsRead(params),
  });
};
