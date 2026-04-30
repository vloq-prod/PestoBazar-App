import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CodSuccessRequest,
  CodSuccessResponse,
  InitiateOrderRequest,
  InitiateOrderResponse,
} from "../types/order.types";
import { codSuccessApi, initiateOrderApi } from "../api/order.api";

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
