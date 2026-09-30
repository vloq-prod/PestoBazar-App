export interface AppUpdateData {
  app_code: string;
  platform: "android" | "ios";
  current_version: string;
  current_build_number: number;
  latest_version: string;
  latest_build_number: number;
  minimum_supported_version: string | null;
  minimum_supported_build_number: number;
  update_type: "none" | "soft" | "force";
  update_available: boolean;
  force_update: boolean;
  can_skip: boolean;
  show_update_button: boolean;
  show_later_button: boolean;
  title: string;
  update_message: string;
  store_url: string;
  released_at: string | null;
}

export interface CheckUpdateResponse {
  status: boolean;
  message: string;
  data?: AppUpdateData;
}
