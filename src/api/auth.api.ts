import { apiClient } from "../lib/apiClient";
import { VisitorApiResponse, VisitorRequest } from "../types/auth.types";

export const createVisitor = async (
  payload: VisitorRequest,
): Promise<VisitorApiResponse> => {
  const response = await apiClient.post<VisitorApiResponse>(
    "/app-api/v1/app-visitor",
    payload,
  );

  console.log("responnse: ", response)

  return response.data;
};