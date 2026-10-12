// src/hooks/wishlistHooks.ts

import React, { useMemo, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlistCount,
  getWishlistData,
  getUserWishlistData,
} from "../api/wishlist.api";
import {
  AddToWishlistRequest,
  RemoveFromWishlistRequest,
  WishlistIdentityParams,
  WishlistToggleResponse,
  WishlistCountResponse,
  WishlistDataResponse,
  UserWishlistResponse,
  WishlistProductItem,
} from "../types/wishlist.types";
import { useToast } from "../context/ToastContext";
import { useWishlistStore } from "../store/wishlistStore";
import { useAppVisitorStore } from "../store/auth";

/**
 * Global fast selector for checking whether a product is currently wishlisted.
 * Reads directly from Zustand store for instant 0-lag renders.
 */
export const useIsWishlisted = (productId: number | undefined): boolean => {
  return useWishlistStore((state) =>
    productId ? Boolean(state.wishlistIds[productId]) : false
  );
};

/**
 * Global fast selector for wishlist item count.
 */
export const useWishlistStoreCount = (): number => {
  return useWishlistStore((state) => state.count);
};

/**
 * Query hook: Get wishlist count for a user/visitor
 * Route: POST /app-api/v1/get-wishlist-count
 */
export const useWishlistCount = (params?: WishlistIdentityParams) => {
  const visitorStore = useAppVisitorStore.getState();
  const userId = params?.user_id ?? visitorStore.userId ?? "";
  const visitorId = params?.visitor_id ?? visitorStore.visitorId ?? "";

  const query = useQuery<WishlistCountResponse>({
    queryKey: ["wishlist-count", String(userId), String(visitorId)],
    queryFn: () => getWishlistCount({ user_id: userId, visitor_id: visitorId }),
    enabled: Boolean(userId || visitorId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  return {
    ...query,
    count: query.data?.data?.count ?? 0,
  };
};

/**
 * Query hook: Get lightweight wishlist & cart product IDs
 * Route: POST /app-api/v1/get-wishlist-data
 */
export const useWishlistData = (params?: WishlistIdentityParams) => {
  const visitorStore = useAppVisitorStore.getState();
  const userId = params?.user_id ?? visitorStore.userId ?? "";
  const visitorId = params?.visitor_id ?? visitorStore.visitorId ?? "";
  const setWishlist = useWishlistStore((state) => state.setWishlist);

  const query = useQuery<WishlistDataResponse>({
    queryKey: ["wishlist-data", String(userId), String(visitorId)],
    queryFn: async () => {
      const response = await getWishlistData({
        user_id: userId,
        visitor_id: visitorId,
      });
      if (response?.status === 1 && response?.data) {
        setWishlist(response.data.wishlist, response.data.count);
      }
      return response;
    },
    enabled: Boolean(userId || visitorId),
    staleTime: 1000 * 60 * 2,
  });

  // Set of product IDs currently wishlisted
  const wishlistProductIds = useMemo(() => {
    const list = Array.isArray(query.data?.data?.wishlist)
      ? query.data.data.wishlist
      : [];
    return new Set<number>(
      list
        .map((item) => Number(item?.product_id))
        .filter((id) => !isNaN(id) && id > 0)
    );
  }, [query.data]);

  // Set of product IDs currently in active cart
  const cartProductIds = useMemo(() => {
    const list = Array.isArray(query.data?.data?.products)
      ? query.data.data.products
      : [];
    return new Set<number>(
      list
        .map((item) => Number(item?.product_id))
        .filter((id) => !isNaN(id) && id > 0)
    );
  }, [query.data]);

  const isWishlisted = useCallback(
    (productId: number): boolean => {
      return wishlistProductIds.has(productId);
    },
    [wishlistProductIds]
  );

  return {
    ...query,
    wishlist: Array.isArray(query.data?.data?.wishlist)
      ? query.data.data.wishlist
      : [],
    cartProducts: Array.isArray(query.data?.data?.products)
      ? query.data.data.products
      : [],
    wishlistProductIds,
    cartProductIds,
    isWishlisted,
    count: query.data?.data?.count ?? 0,
  };
};

/**
 * Sync hook: keeps Zustand wishlist store synchronized with backend.
 */
export const useWishlistSync = (params?: WishlistIdentityParams) => {
  const { data } = useWishlistData(params);
  const setWishlist = useWishlistStore((state) => state.setWishlist);

  React.useEffect(() => {
    if (data?.status === 1 && data?.data) {
      setWishlist(data.data.wishlist, data.data.count);
    }
  }, [data, setWishlist]);
};

/**
 * Query hook: Get full wishlist items with complete product details
 * Route: POST /app-api/v1/get-user-wishlist-data
 */
export const useUserWishlist = (params?: WishlistIdentityParams) => {
  const { userId: storeUserId, visitorId: storeVisitorId } =
    useAppVisitorStore();
  const userId = params?.user_id ?? storeUserId ?? "";
  const visitorId = params?.visitor_id ?? storeVisitorId ?? "";

  const query = useQuery<UserWishlistResponse>({
    queryKey: ["user-wishlist-data", String(userId), String(visitorId)],
    queryFn: () =>
      getUserWishlistData({ user_id: userId, visitor_id: visitorId }),
    enabled: Boolean(userId || visitorId),
    staleTime: 1000 * 60 * 2,
  });

  const products: WishlistProductItem[] = useMemo(() => {
    const raw = query.data?.data?.product_master;
    return Array.isArray(raw) ? raw : [];
  }, [query.data]);

  const count = query.data?.data?.count ?? products.length;

  return {
    ...query,
    products,
    count,
  };
};

/**
 * Mutation hook: Add / Toggle product in wishlist
 * Route: POST /app-api/v1/wishlist
 */
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation<WishlistToggleResponse, Error, AddToWishlistRequest>({
    mutationFn: async (payload: AddToWishlistRequest) => {
      const data = await addToWishlist(payload);
      if (data.status === 0) {
        throw new Error(data.message || "Failed to update wishlist");
      }
      return data;
    },
    onSuccess: (data, variables) => {
      const userId = variables.user_id ?? "";
      const visitorId = variables.visitor_id ?? "";

      if (data?.data) {
        useWishlistStore
          .getState()
          .setWishlisted(
            variables.product_id,
            data.data.is_wishlisted,
            data.data.count
          );
      }

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: ["wishlist-count", String(userId), String(visitorId)],
      });
      queryClient.invalidateQueries({
        queryKey: ["wishlist-data", String(userId), String(visitorId)],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-wishlist-data", String(userId), String(visitorId)],
      });
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update wishlist";
      const isWarning = /login|stock|limit|only|warning/i.test(msg);
      showToast(msg, isWarning ? "warning" : "error");
    },
  });
};

/**
 * Mutation hook: Remove product from wishlist
 * Route: POST /app-api/v1/remove-from-wishlist
 */
export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation<WishlistToggleResponse, Error, RemoveFromWishlistRequest>({
    mutationFn: async (payload: RemoveFromWishlistRequest) => {
      const data = await removeFromWishlist(payload);
      if (data.status === 0 || (data as any).status === "0") {
        throw new Error(data.message || "Failed to remove from wishlist");
      }
      return data;
    },
    onSuccess: (data, variables) => {
      const userId = variables.user_id ?? "";
      const visitorId = variables.visitor_id ?? "";

      if (data?.data) {
        useWishlistStore
          .getState()
          .setWishlisted(
            variables.product_id,
            false,
            data.data.count
          );
      }

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: ["wishlist-count", String(userId), String(visitorId)],
      });
      queryClient.invalidateQueries({
        queryKey: ["wishlist-data", String(userId), String(visitorId)],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-wishlist-data", String(userId), String(visitorId)],
      });
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to remove from wishlist";
      showToast(msg, "error");
    },
  });
};

/**
 * Universal toggle hook: handles optimistic UI update, api call, and rollback on error.
 */
export const useToggleWishlist = () => {
  const { mutate: addToWishlistMutate, isPending } = useAddToWishlist();
  const { showToast } = useToast();

  const toggle = useCallback(
    (productId: number, options?: { onError?: (err: any) => void }) => {
      const { userId, visitorId } = useAppVisitorStore.getState();
      const wishlistStore = useWishlistStore.getState();

      const wasWishlisted = Boolean(wishlistStore.wishlistIds[productId]);

      // 1. Optimistic toggle
      wishlistStore.toggleWishlist(productId);

      // 2. Call API
      addToWishlistMutate(
        {
          product_id: productId,
          user_id: userId ? String(userId) : "",
          visitor_id: visitorId || "",
        },
        {
          onError: (err) => {
            // Revert state on error
            wishlistStore.setWishlisted(productId, wasWishlisted);
            options?.onError?.(err);
          },
        }
      );
    },
    [addToWishlistMutate, showToast]
  );

  return {
    toggleWishlist: toggle,
    isPending,
  };
};
