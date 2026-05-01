import { apiClient } from "../lib/apiClient";
import { CodSuccessRequest, CodSuccessResponse, InitiateOrderRequest, InitiateOrderResponse, ViewOrderRequest, ViewOrderResponse } from "../types/order.types";



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


export const viewOrderApi = async (
  params: ViewOrderRequest
): Promise<ViewOrderResponse> => {
  const response =
    await apiClient.get<ViewOrderResponse>(
      `/app-api/v1/view-order/${params.order_id}`
    );

  return response.data;
};