import { apiClient } from "../lib/apiClient";
import {
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  VerifyUserRequest,
  VerifyUserResponse,
  VisitorApiResponse,
  VisitorRequest,
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
  payload: VerifyOtpRequest
): Promise<VerifyOtpResponse> => {
  const response = await apiClient.post<VerifyOtpResponse>(
    "/app-api/v1/verify-otp",
    payload
  );

  return response.data;
};



export const verifyUser = async (
  payload: VerifyUserRequest
): Promise<VerifyUserResponse> => {
  const response = await apiClient.post(
    "/app-api/v1/verify-user",
    payload
  );

  return response.data;
};

