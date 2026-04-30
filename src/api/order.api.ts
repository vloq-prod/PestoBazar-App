import { apiClient } from "../lib/apiClient";
import { CodSuccessRequest, CodSuccessResponse, InitiateOrderRequest, InitiateOrderResponse } from "../types/order.types";



export const codSuccessApi = async (
  payload: CodSuccessRequest
): Promise<CodSuccessResponse> => {
  const response =
    await apiClient.post<CodSuccessResponse>(
      "/app-api/v1/cod-success",
      payload
    );

  return response.data;
};



export const initiateOrderApi = async (
  payload: InitiateOrderRequest
): Promise<InitiateOrderResponse> => {
  const response =
    await apiClient.post<InitiateOrderResponse>(
      "/app-api/v1/initiate-order",
      payload
    );

  return response.data;
};
