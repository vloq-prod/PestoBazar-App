import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addToCart,
  getCart,
  getCartCount,
  getQuickCart,
  removeCartItem,
} from "../api/cart.api";
import {
  AddToCartRequest,
  CartCountResponse,
  CartResponse,
  GetCartCountParams,
  GetQuickCartParams,
  QuickCartResponse,
  RemoveCartItemRequest,
} from "../types/cart.types";
import { useToast } from "../context/ToastContext";
import { getCartQuantity } from "../api/home.api";
import { GetCartQuantityParams, GetCartQuantityResponse } from "../types/home.types";
import { useCartStore } from "../store/cartStore";

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

    const mutation = useMutation({
      mutationFn: async (payload: AddToCartRequest) => {
        // ✅ Payload logging
        console.log("🛒 AddToCart Payload:", payload);

        const data = await addToCart(payload);
        if (data.status === 0) {
          throw new Error(data.message || "Failed to update cart");
        }
        return data;
      },

      onError: (error: any) => {
        showToast(error?.message || "Failed to add to cart", "error");
      },

      onSuccess: (data, variables) => {
        showToast(data.message || "Product added to cart", "success");

        queryClient.invalidateQueries({
          queryKey: [
            "cart",
            variables.user_id ?? 0,
            variables.visitor_id ?? "",
          ],
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
        queryClient.invalidateQueries({
          queryKey: ["cart-quantity"],
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
  user_id: number | string;
  visitor_id: string;
}

export const useCart = (params: UseCartParams) => {
  return useQuery<CartResponse>({
    queryKey: ["cart", params.user_id, params.visitor_id],

    queryFn: () => getCart(params),

    enabled: !!params.visitor_id || !!params.user_id,
  });
};

export const useCartCount = (params: GetCartCountParams) => {
  return useQuery<CartCountResponse>({
    queryKey: ["cart-count", params.user_id, params.visitor_id],

    queryFn: async () => {
      // ✅ Payload logging (request params)
      console.log("🧾 CartCount Payload:", params);

      const response = await getCartCount(params);

      // ✅ Response logging
      console.log("📊 CartCount Response:", response);

      return response;
    },
  });
};;

export const useQuickCart = (params: GetQuickCartParams) => {
  return useQuery<QuickCartResponse>({
    queryKey: ["quick-cart", params.user_id, params.visitor_id],
    queryFn: () => getQuickCart(params),
  });
};

export const useCartAction = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: AddToCartRequest) => addToCart(payload),

    onMutate: async (variables) => {
      const cartKey = [
        "cart",
        variables.user_id ?? 0,
        variables.visitor_id ?? "",
      ];
      const cartCountKey = [
        "cart-count",
        variables.user_id ?? 0,
        variables.visitor_id ?? "",
      ];

      await queryClient.cancelQueries({ queryKey: cartKey });
      await queryClient.cancelQueries({ queryKey: cartCountKey });

      const previousCart = queryClient.getQueryData<CartResponse>(cartKey);
      const previousCartCount =
        queryClient.getQueryData<CartCountResponse>(cartCountKey);

      if (previousCart?.data?.cart_details) {
        const nextCartDetails = previousCart.data.cart_details
          .map((item) => {
            const matchesProduct =
              item.product_id === variables.product_id ||
              item.variation_id === variables.product_id;

            if (!matchesProduct) return item;

            return {
              ...item,
              qty: variables.qty,
              total_price: String(
                Number(item.price_per_piece || 0) * variables.qty,
              ),
            };
          })
          .filter((item) => item.qty > 0);

        queryClient.setQueryData<CartResponse>(cartKey, {
          ...previousCart,
          data: {
            ...previousCart.data,
            cart: {
              ...previousCart.data.cart,
              cart_count: nextCartDetails.reduce(
                (sum, item) => sum + Number(item.qty || 0),
                0,
              ),
            },
            cart_details: nextCartDetails,
          },
        });

        queryClient.setQueryData<CartCountResponse>(cartCountKey, {
          ...(previousCartCount ?? {
            message: "",
            status: 200,
          }),
          data: nextCartDetails.reduce(
            (sum, item) => sum + Number(item.qty || 0),
            0,
          ),
        });
      }

      return { previousCart, previousCartCount, cartKey, cartCountKey };
    },

    onError: (error: any) => {
      console.log(
        "❌ CartAction Error:",
        error?.response?.data || error?.message,
      );
    },

    onSettled: (_data, _error, variables, context) => {
      if (_error && context?.previousCart) {
        queryClient.setQueryData(context.cartKey, context.previousCart);
      }

      if (_error && context?.previousCartCount) {
        queryClient.setQueryData(
          context.cartCountKey,
          context.previousCartCount,
        );
      }

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

      queryClient.invalidateQueries({
        queryKey: ["cart-quantity"],
      });
    },

    onSuccess: (data, variables) => {
      // console.log("✅ CartAction Success:", data?.message, data?.data);
    },
  });

  return {
    updateCart: mutation.mutate,
    loading: mutation.isPending,
  };
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (payload: RemoveCartItemRequest) => removeCartItem(payload),

    onSuccess: (data) => {
      showToast(data.message || "Item removed from cart", "success");
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });

      queryClient.invalidateQueries({
        queryKey: ["cart-count"],
      });

      queryClient.invalidateQueries({
        queryKey: ["cart-quantity"],
      });
    },

    onError: (error) => {
      showToast(error.message || "Failed to remove item", "error");
    },
  });
};

export const useCartQuantity = ({
  visitor_id,
  user_id,
}: GetCartQuantityParams) => {
  const setCart = useCartStore((state) => state.setCart);

  return useQuery<GetCartQuantityResponse>({
    queryKey: ["cart-quantity", visitor_id, user_id],
    queryFn: async () => {
      const response = await getCartQuantity({ visitor_id, user_id });
      if (response?.status === 1 && Array.isArray(response.data)) {
        setCart(response.data);
      }
      return response;
    },
    enabled: !!visitor_id && !!user_id,
  });
};

export const useCartQuantitySync = ({
  visitor_id,
  user_id,
}: GetCartQuantityParams) => {
  const { data } = useCartQuantity({ visitor_id, user_id });
  const setCart = useCartStore((state) => state.setCart);

  React.useEffect(() => {
    if (data?.status === 1 && Array.isArray(data.data)) {
      setCart(data.data);
    }
  }, [data, setCart]);
};

export const useProductQuantity = (productId: number | undefined) => {
  return useCartStore((state) => (productId ? state.items[productId] ?? 0 : 0));
};
