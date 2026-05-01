import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CodSuccessRequest,
  CodSuccessResponse,
  InitiateOrderRequest,
  InitiateOrderResponse,
  ViewOrderRequest,
  ViewOrderResponse,
} from "../types/order.types";
import { codSuccessApi, initiateOrderApi, viewOrderApi } from "../api/order.api";

export const useCodSuccess = () => {
  const queryClient = useQueryClient();

  return useMutation<CodSuccessResponse, Error, CodSuccessRequest>({
    mutationFn: codSuccessApi,

    onSuccess: (response) => {
      console.log("✅", response.message);
      console.log("Order ID:", response.order_id);

      // refresh strategic cache
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });

      queryClient.invalidateQueries({
        queryKey: ["user-order-history"],
      });
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