import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CodSuccessRequest,
  CodSuccessResponse,
  InitiateOrderRequest,
  InitiateOrderResponse,
  PaymentSuccessRequest,
  PaymentSuccessResponse,
  UserOrderHistoryRequest,
  UserOrderHistoryResponse,
  ViewOrderRequest,
  ViewOrderResponse,
  CancelReasonResponse,
  CancelOrderRequest,
  CancelOrderResponse,
  ReturnReasonResponse,
} from "../types/order.types";
import { codSuccessApi, getUserOrderHistoryApi, initiateOrderApi, paymentSuccessApi, viewOrderApi, getCancelReasonApi, cancelOrderApi, getCustomerReturnOrder, getReturnHistory, uploadReturnVideo, returnProduct, saveReturnImage, getReturnReasonApi, getOrderDetail } from "../api/order.api";

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

    staleTime: 0,
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


export const useCancelReason = () => {
  return useQuery<CancelReasonResponse>({
    queryKey: ["cancel-reason"],
    queryFn: getCancelReasonApi,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<CancelOrderResponse, Error, CancelOrderRequest>({
    mutationFn: cancelOrderApi,

    onSuccess: (response, variables) => {
      console.log("✅", response.message);

      // Optimistic update for instant change
      queryClient.setQueryData(["view-order", variables.order_id], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            order: {
              ...oldData.data.order,
              current_status: "Cancelled",
            }
          }
        };
      });

      // Strategic refresh
      queryClient.invalidateQueries({ queryKey: ["user-order-history"] });
      queryClient.invalidateQueries({ queryKey: ["view-order", variables.order_id] });
      queryClient.invalidateQueries({ queryKey: ["view-order"] });
    },

    onError: (error) => {
      console.log("❌", error.message);
    },
  });
};


export const useCustomerReturnOrder = (
  returnId?: string,
) => {
  return useQuery({
    queryKey: ["customer-return-order", returnId],
    queryFn: () => getCustomerReturnOrder(returnId!),
    enabled: !!returnId,
    staleTime: 1000 * 60 * 5,
  });
};


export const useReturnHistory = (userId?: string) => {
  return useQuery({
    queryKey: ["return-history", userId],
    queryFn: () => getReturnHistory(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUploadReturnVideo = () => {
  return useMutation({
    mutationFn: uploadReturnVideo,
  });
};

export const useReturnProduct = () => {
  return useMutation({
    mutationFn: returnProduct,
  });
};


export const useSaveReturnImage = () => {
  return useMutation({
    mutationFn: saveReturnImage,
  });
};

export const useReturnReason = () => {
  return useQuery<ReturnReasonResponse>({
    queryKey: ["return-reason"],
    queryFn: getReturnReasonApi,
  });
};

export const useOrderDetail = (
  orderId?: string,
) => {
  return useQuery({
    queryKey: ["order-detail", orderId],
    queryFn: () => getOrderDetail(orderId!),
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5,
  });
};