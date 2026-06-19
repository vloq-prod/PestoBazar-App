import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CodSuccessRequest,
  CodSuccessResponse,
  InitiateOrderRequest,
  InitiateOrderResponse,
  PaymentSuccessRequest,
  PaymentSuccessResponse,
  ReturnRefundListPayload,
  UserOrderHistoryRequest,
  UserOrderHistoryResponse,
  ViewOrderRequest,
  ViewOrderResponse,
} from "../types/order.types";
import { codSuccessApi, getReturnRefundListApi, getUserOrderHistoryApi, initiateOrderApi, paymentSuccessApi, viewOrderApi } from "../api/order.api";

export const useCodSuccess = () => {
  const queryClient = useQueryClient();

  return useMutation<CodSuccessResponse, Error, CodSuccessRequest>({
    mutationFn: codSuccessApi,

    onSuccess: (response) => {
      console.log("✅", response.message);
      console.log("Order ID:", response.order_id);

      // Strategic refresh
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
      queryClient.invalidateQueries({ queryKey: ["quick-cart"] });
      queryClient.invalidateQueries({ queryKey: ["user-order-history"] });
    },

    onError: (error) => {
      console.log("❌", error.message);
    },
  });
};

// ======================================================
// src/services/order/order.hooks.ts
// ======================================================

export const useInitiateOrder = () => {
  return useMutation<InitiateOrderResponse, Error, InitiateOrderRequest>({
    mutationFn: initiateOrderApi,

    onSuccess: (response) => {
      console.log("✅", response.message);
      console.log("Order Data:", response.data);
    },

    onError: (error) => {
      console.log("❌", error.message);
    },
  });
};



export const useViewOrder = (
  params: ViewOrderRequest
) => {
  return useQuery<ViewOrderResponse>({
    queryKey: [
      "view-order",
      params.order_id,
    ],

    queryFn: () =>
      viewOrderApi(params),

    enabled: !!params.order_id,

    staleTime: 1000 * 60 * 5,
  });
};




export const useUserOrderHistory = (
  params: UserOrderHistoryRequest
) => {
  return useQuery<UserOrderHistoryResponse>({
    queryKey: [
      "user-order-history",
      params.user_id,
    ],

    queryFn: () =>
      getUserOrderHistoryApi(params),

    enabled: !!params.user_id,

    staleTime: 1000 * 60 * 5,
  });
};




// ======================================================
// src/services/payment/payment.hooks.ts
// ======================================================


export const usePaymentSuccess = () => {
  const queryClient = useQueryClient();

  return useMutation<
    PaymentSuccessResponse,
    Error,
    PaymentSuccessRequest
  >({
    mutationFn: paymentSuccessApi,

    onSuccess: (response) => {
      console.log("✅", response.message);

      // Strategic refresh
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
      queryClient.invalidateQueries({ queryKey: ["quick-cart"] });
      queryClient.invalidateQueries({ queryKey: ["user-order-history"] });
    },

    onError: (error) => {
      console.log("❌", error.message);
    },
  });
};



export const useReturnRefundList = (
  payload: ReturnRefundListPayload
) => {
  return useQuery({
    queryKey: ["return-refund-list", payload],
    queryFn: () => getReturnRefundListApi(payload),
    staleTime: 1000 * 60 * 5,
  });
};