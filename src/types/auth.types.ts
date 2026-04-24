


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
  otp_channel: "sms" | "whatsapp" | "both" ;
}
export interface ApiResponse<T> {
  message: string;
  status: number;
  data: T;
}
export type SendOtpResponse = ApiResponse<[]>;



// Verify OTP Request
export interface VerifyOtpRequest {
  mobile: string;
  visitor_id: string;
  otp: string;
  full_name?: string; // only when new user
}

// Verify OTP Response Data
export interface VerifyOtpData {
  user_id: string;
  user_name: string;
}

// Final Response Type
export type VerifyOtpResponse = ApiResponse<VerifyOtpData>;


export interface VerifyUserRequest {
  mobile_no: string;
}

export interface VerifyUserResponse {
  message: string;
  status: number;
  data: {
    exists: number; // 1 = exists, 0 = new user
  };
}


