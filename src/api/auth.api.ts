import { apiClient } from "../lib/apiClient";
import {
  GoogleCallbackRequest,
  GoogleCallbackResponse,
  AppleCallbackRequest,
  AppleCallbackResponse,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  VerifyUserRequest,
  VerifyUserResponse,
  VisitorApiResponse,
  VisitorRequest,
  LoginBannerApiResponse,
} from "../types/auth.types";

export const createVisitor = async (
  payload: VisitorRequest,
): Promise<VisitorApiResponse> => {
  const response = await apiClient.post<VisitorApiResponse>(
    "/app-api/v1/app-visitor",
    payload,
  );

  return response.data;
};

// src/services/auth/auth.api.ts
export const sendOtpApi = async (
  payload: SendOtpRequest,
): Promise<SendOtpResponse> => {
  const response = await apiClient.post<SendOtpResponse>(
    "/app-api/v1/send-otp",
    payload,
  );

  return response.data;
};

export const verifyOtpApi = async (
  payload: VerifyOtpRequest,
): Promise<VerifyOtpResponse> => {
  const response = await apiClient.post<VerifyOtpResponse>(
    "/app-api/v1/verify-otp",
    payload,
  );

  return response.data;
};

export const verifyUser = async (
  payload: VerifyUserRequest,
): Promise<VerifyUserResponse> => {
  const response = await apiClient.post("/app-api/v1/verify-user", payload);

  return response.data;
};

export const googleAuthCallback = async (
  payload: GoogleCallbackRequest,
): Promise<GoogleCallbackResponse> => {
  const response = await apiClient.post<GoogleCallbackResponse>(
    "/app-api/v1/auth/google/callback",
    payload,
  );

  return response.data;
};

export const appleAuthCallback = async (
  payload: AppleCallbackRequest,
): Promise<AppleCallbackResponse> => {
  const response = await apiClient.post<AppleCallbackResponse>(
    "/app-api/v1/auth/apple/callback",
    payload,
  );

  return response.data;
};

export const getLoginBanners = async (): Promise<LoginBannerApiResponse> => {
  const response = await apiClient.get<LoginBannerApiResponse>(
    "/app-api/v1/login-img",
  );

  return response.data;
};

