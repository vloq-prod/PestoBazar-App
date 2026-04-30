// ======================================================
// src/services/order/order.hooks.ts
// ======================================================

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { codSuccessApi, userOrderHistoryApi, viewOrderApi } from "../api/order.api";
import { CodSuccessRequest, CodSuccessResponse, UserOrderHistoryRequest, UserOrderHistoryResponse, ViewOrderRequest, ViewOrderResponse } from "../types/order.types";



export const useCodSuccess = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CodSuccessResponse,
    Error,
    CodSuccessRequest
  >({
    mutationFn: codSuccessApi,

    onSuccess: (response) => {
      console.log("✅", response.message);
      console.log("📦 Order ID:", response.order_id);

      // refresh cart / orders
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });

      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
    },

    onError: (error) => {
      console.log("❌ COD Failed");
      console.log(error.message);
    },
  });
};






// ======================================================
// src/services/order/order.hooks.ts
// ADD THIS IN SAME FILE
// ======================================================


export const useViewOrder = (
  params: ViewOrderRequest
) => {
  return useQuery<
    ViewOrderResponse,
    Error
  >({
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
  return useQuery<
    UserOrderHistoryResponse,
    Error
  >({
    queryKey: [
      "user-order-history",
      params.user_id,
    ],

    queryFn: () =>
      userOrderHistoryApi(params),

    enabled: !!params.user_id,

    staleTime: 1000 * 60 * 5,
  });
};