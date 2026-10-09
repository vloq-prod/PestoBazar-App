export interface RequestCallBackPayload {
  name: string;
  contact_no: string;
  email?: string;
  message: string;
  source_url?: string;
}

export interface RequestCallBackData {
  request_id: number;
}

export interface RequestCallBackResponse {
  status: number;
  message: string;
  data?: RequestCallBackData;
  errors?: Record<string, string[]>;
}
