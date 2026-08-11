export interface NotificationData {
  order_id?: string;
  order_no?: string;
  order_status?: string;
  custom_notification_id?: number;
  [key: string]: unknown;
}

export interface Notification {
  id: number;
  source_type: string;
  source_entity_type: string;
  source_entity_id: number;
  event_key: string;
  notification_type: string;
  title: string;
  description: string;
  image_url: string | null;
  action_type: string;
  action_value: string | null;
  data: NotificationData;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  created_at_human: string;
}

export interface NotificationPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  has_more: boolean;
}

export interface NotificationResponseData {
  unread_count: number;
  notifications: Notification[];
  pagination: NotificationPagination;
}

export interface NotificationResponse {
  status: boolean;
  message: string;
  data: NotificationResponseData;
}

export interface GetNotificationsParams {
  user_id?: string;
  visitor_id?: string;
  page?: number;
}



export interface MarkNotificationReadParams {
  notificationId: number;
  user_id?: string;
  visitor_id?: string;
}

export interface MarkNotificationReadResponse {
  status: boolean;
  message: string;
  data: Notification;
}

export interface UnreadNotificationCountResponse {
  status: boolean;
  message: string;
  data: {
    unread_count: number;
  };
}

export interface GetUnreadNotificationCountParams {
  user_id?: string;
  visitor_id?: string;
  page?: number;
}


export interface MarkAllNotificationsReadParams {
  user_id?: string;
  visitor_id?: string;
}

export interface MarkAllNotificationsReadResponse {
  status: boolean;
  message: string;
  data: {
    updated_count: number;
    unread_count: number;
  };
}