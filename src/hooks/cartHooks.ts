import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addToCart,
  getCart,
  getCartCount,
  getQuickCart,
} from "../api/cart.api";
import {
  AddToCartRequest,
  CartCountResponse,
  CartResponse,
  GetCartCountParams,
  GetQuickCartParams,
  QuickCartResponse,
} from "../types/cart.types";

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: AddToCartRequest) => addToCart(payload),

    onError: (error: any) => {
      console.log("❌ AddToCart Error:", error?.message);
    },

    onSuccess: (data, variables) => {
      console.log("✅ Added to Cart:", data.message);

      queryClient.invalidateQueries({
        queryKey: ["cart", variables.user_id ?? 0, variables.visitor_id ?? ""],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "cart-count",
          variables.user_id ?? 0,
          variables.visitor_id ?? "",
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "quick-cart",
          variables.user_id ?? 0,
          variables.visitor_id ?? "",
        ],
      });
    },
  });

  return {
    addToCart: mutation.mutate,
    addToCartAsync: mutation.mutateAsync,
    loading: mutation.isPending,
    data: mutation.data,
    error: mutation.error,
  };
};

interface UseCartParams {
  user_id: number;
  visitor_id: string;
}

export const useCart = (params: UseCartParams) => {
  return useQuery<CartResponse>({
    queryKey: ["cart", params.user_id, params.visitor_id],
    queryFn: () => getCart(params),
    enabled: !!params.visitor_id,
  });
};

export const useCartCount = (params: GetCartCountParams) => {
  return useQuery<CartCountResponse>({
    queryKey: ["cart-count", params.user_id, params.visitor_id],
    queryFn: () => getCartCount(params),

    // 🔥 Important for badge updates
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

export const useQuickCart = (params: GetQuickCartParams) => {
  return useQuery<QuickCartResponse>({
    queryKey: ["quick-cart", params.user_id, params.visitor_id],
    queryFn: () => getQuickCart(params),

    // optimized for small UI preview (header / mini cart)
    staleTime: 1000 * 60 * 2, // 2 min cache
  });
};



// src/hooks/useUpdateCart.ts

export const useCartAction = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: AddToCartRequest) => addToCart(payload),

    onError: (error: any) => {
      console.log("❌ CartAction Error:", error?.response?.data || error?.message);
    },

    onSuccess: (data, variables) => {
      console.log("✅ CartAction Success:", data?.message, data?.data);

      queryClient.invalidateQueries({
        queryKey: ["cart", variables.user_id ?? 0, variables.visitor_id ?? ""],
      });

      queryClient.invalidateQueries({
        queryKey: ["cart-count", variables.user_id ?? 0, variables.visitor_id ?? ""],
      });

      queryClient.invalidateQueries({
        queryKey: ["quick-cart", variables.user_id ?? 0, variables.visitor_id ?? ""],
      });
    },
  });

  return {
    updateCart: mutation.mutate,
    loading: mutation.isPending,
  };
};
