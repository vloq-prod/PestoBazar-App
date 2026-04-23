


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



// Verify OTP Request
export interface VerifyOtpRequest {
  mobile: string;
  visitor_id: string;
  otp: string;
  full_name?: string; // optional (only when user_exists = 0)
}

// Verify OTP Response Data
export interface VerifyOtpData {
  user_exists: "0" | "1";
  id: string;
  first_name: string;
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


