import { useMutation } from "@tanstack/react-query";
import { addToCart } from "../api/cart.api";
import {
  AddToCartRequest,
} from "../types/cart.types";

export const useAddToCart = () => {
  const mutation = useMutation({
    mutationFn: (payload: AddToCartRequest) =>
      addToCart(payload),

    onError: (error: any) => {
      console.log("❌ AddToCart Error:", error?.message);
    },

    onSuccess: (data) => {
      console.log("✅ Added to Cart:", data.message);
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