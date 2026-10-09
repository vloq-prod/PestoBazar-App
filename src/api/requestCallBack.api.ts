import { apiClient } from "../lib/apiClient";
import {
  RequestCallBackPayload,
  RequestCallBackResponse,
} from "../types/requestCallBack.types";

export const submitRequestCallBack = async (
  payload: RequestCallBackPayload,
): Promise<RequestCallBackResponse> => {
  const { data } = await apiClient.post<RequestCallBackResponse>(
    "/app-api/v1/request-call-back",
    payload,
  );

  return data;
};
