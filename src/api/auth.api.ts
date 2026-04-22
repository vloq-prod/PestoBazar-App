import { apiClient } from "../lib/apiClient";
import {
  SendOtpRequest,
  SendOtpResponse,
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
