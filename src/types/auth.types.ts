


export interface VisitorRequest {
  visitor_id: string;
}

export interface VisitorResponse {
  visitor_id: string;
  token: string;
}

export interface VisitorApiResponse {
  visitor_id: string;
  token: string;
}



export interface SendOtpRequest {
  mobile_no: string;
  otp_channel: "sms" | "whatsapp";
}
export interface ApiResponse<T> {
  message: string;
  status: number;
  data: T;
}
export type SendOtpResponse = ApiResponse<[]>;