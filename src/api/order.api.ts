import { apiClient } from "../lib/apiClient";
import { CodSuccessRequest, CodSuccessResponse, UserOrderHistoryRequest, UserOrderHistoryResponse, ViewOrderRequest, ViewOrderResponse } from "../types/order.types";

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



export const viewOrderApi = async (
  params: ViewOrderRequest
): Promise<ViewOrderResponse> => {
  const response =
    await apiClient.get<ViewOrderResponse>(
      `/app-api/v1/view-order/${params.order_id}`
    );

  return response.data;
};





export const userOrderHistoryApi = async (
  params: UserOrderHistoryRequest
): Promise<UserOrderHistoryResponse> => {
  const response =
    await apiClient.get<UserOrderHistoryResponse>(
      `/app-api/v1/user-order-history/${params.user_id}`
    );

  return response.data;
};