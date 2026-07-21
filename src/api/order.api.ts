import { apiClient } from "../lib/apiClient";
import { CodSuccessRequest, CodSuccessResponse, InitiateOrderRequest, InitiateOrderResponse, PaymentSuccessRequest, PaymentSuccessResponse, UserOrderHistoryRequest, UserOrderHistoryResponse, ViewOrderRequest, ViewOrderResponse, CancelReasonResponse, CancelOrderRequest, CancelOrderResponse, ViewCustomerReturnOrderResponse, ReturnHistoryResponse, UploadReturnVideoResponse, ReturnProductRequest, ReturnProductResponse, SaveReturnImageRequest, SaveReturnImageResponse, ReturnReasonResponse, OrderDetailResponse } from "../types/order.types";



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





export const getCancelReasonApi = async (): Promise<CancelReasonResponse> => {
  const response = await apiClient.get<CancelReasonResponse>(
    "/app-api/v1/cancel-reason"
  );
  return response.data;
};

export const cancelOrderApi = async (
  payload: CancelOrderRequest
): Promise<CancelOrderResponse> => {
  const response = await apiClient.post<CancelOrderResponse>(
    "/app-api/v1/cancel-order",
    payload
  );
  return response.data;
};



export const getCustomerReturnOrder = async (
  returnId: string,
): Promise<ViewCustomerReturnOrderResponse> => {
  const { data } =
    await apiClient.get<ViewCustomerReturnOrderResponse>(
      "/app-api/v1/view-customer-return-orders",
      {
        params: {
          return_id: returnId,
        },
      },
    );

  return data;
};



export const getReturnHistory = async (
  userId: string
): Promise<ReturnHistoryResponse> => {
  const { data } = await apiClient.get<ReturnHistoryResponse>(
    `app-api/v1/user-return-history/${userId}`
  );

  return data;
};


export const uploadReturnVideo = async (
  video: {
    uri: string;
    name: string;
    type: string;
  }
): Promise<UploadReturnVideoResponse> => {
  const formData = new FormData();

  formData.append("video", {
    uri: video.uri,
    name: video.name,
    type: video.type,
  } as any);

  const { data } = await apiClient.post<UploadReturnVideoResponse>(
    "app-api/v1/upload-return-video",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};




export const returnProduct = async (
  payload: ReturnProductRequest
): Promise<ReturnProductResponse> => {
  const { data } = await apiClient.post<ReturnProductResponse>(
    "app-api/v1/return-product",
    payload
  );

  return data;
};



export const saveReturnImage = async (
  payload: SaveReturnImageRequest
): Promise<SaveReturnImageResponse> => {
  const { data } = await apiClient.post<SaveReturnImageResponse>(
    "app-api/v1/save-return-image",
    payload
  );

  return data;
};

export const getReturnReasonApi = async (): Promise<ReturnReasonResponse> => {
  const { data } = await apiClient.get<ReturnReasonResponse>(
    "app-api/v1/return-reason"
  );
  return data;
};


export const getOrderDetail = async (
  orderId: string,
): Promise<OrderDetailResponse> => {

  console.log("order id from api :", orderId)
  const { data } = await apiClient.get<OrderDetailResponse>(
    `/app-api/v1/order-detail/${orderId}`,
  );

  return data;
};