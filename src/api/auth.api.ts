import { apiClient } from "../lib/apiClient";
import { VisitorApiResponse, VisitorRequest } from "../utils/auth.types";

export const createVisitor = async (
  payload: VisitorRequest,
): Promise<VisitorApiResponse> => {
  const response = await apiClient.post<VisitorApiResponse>(
    "/app-api/v1/app-visitor",
    payload,
  );

  return response.data;
};