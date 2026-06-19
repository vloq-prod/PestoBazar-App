import { apiClient } from "../lib/apiClient";
import { CodSuccessRequest, CodSuccessResponse, InitiateOrderRequest, InitiateOrderResponse, PaymentSuccessRequest, PaymentSuccessResponse, ReturnRefundListPayload, ReturnRefundResponse, UserOrderHistoryRequest, UserOrderHistoryResponse, ViewOrderRequest, ViewOrderResponse } from "../types/order.types";



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






export const getUserOrderHistoryApi = async (
  params: UserOrderHistoryRequest
): Promise<UserOrderHistoryResponse> => {
  const response =
    await apiClient.get<UserOrderHistoryResponse>(
      `/app-api/v1/user-order-history/${params.user_id}`
    );

  return response.data;
};




export const paymentSuccessApi = async (
  payload: PaymentSuccessRequest
): Promise<PaymentSuccessResponse> => {
  const response =
    await apiClient.post<PaymentSuccessResponse>(
      "/app-api/v1/payment-success",
      payload
    );

  return response.data;
};



export const getReturnRefundListApi = async (
  payload: ReturnRefundListPayload
): Promise<ReturnRefundResponse> => {
  const response = await apiClient.post(
    "/app-api/v1/return-refund-list",
    payload
  );

  return response.data;
};