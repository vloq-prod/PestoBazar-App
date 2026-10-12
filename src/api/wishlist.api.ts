// src/api/wishlist.api.ts

import { apiClient } from "../lib/apiClient";
import {
  AddToWishlistRequest,
  WishlistToggleResponse,
  RemoveFromWishlistRequest,
  WishlistIdentityParams,
  WishlistCountResponse,
  WishlistDataResponse,
  UserWishlistResponse,
} from "../types/wishlist.types";

/**
 * Format wishlist identity payload cleanly.
 * user_id is optional and defaults to empty string if not provided.
 */
const buildIdentityPayload = (params: WishlistIdentityParams) => {
  return {
    user_id: params.user_id !== undefined && params.user_id !== null ? String(params.user_id) : "",
    visitor_id: params.visitor_id !== undefined && params.visitor_id !== null ? String(params.visitor_id) : "",
  };
};

/**
 * Add / Toggle a product in user wishlist.
 * Route: POST /app-api/v1/wishlist
 */
export const addToWishlist = async (
  payload: AddToWishlistRequest
): Promise<WishlistToggleResponse> => {
  const body = {
    ...buildIdentityPayload(payload),
    product_id: payload.product_id,
  };

  const response = await apiClient.post<WishlistToggleResponse>(
    "/app-api/v1/wishlist",
    body
  );

  return response.data;
};

/**
 * Remove a product from user wishlist.
 * Route: POST /app-api/v1/remove-from-wishlist
 */
export const removeFromWishlist = async (
  payload: RemoveFromWishlistRequest
): Promise<WishlistToggleResponse> => {
  const body = {
    ...buildIdentityPayload(payload),
    product_id: payload.product_id,
  };

  const response = await apiClient.post<WishlistToggleResponse>(
    "/app-api/v1/remove-from-wishlist",
    body
  );

  return response.data;
};

/**
 * Get total count of items in user wishlist.
 * Route: POST /app-api/v1/get-wishlist-count
 */
export const getWishlistCount = async (
  params: WishlistIdentityParams
): Promise<WishlistCountResponse> => {
  const body = buildIdentityPayload(params);

  const response = await apiClient.post<WishlistCountResponse>(
    "/app-api/v1/get-wishlist-count",
    body
  );

  return response.data;
};

/**
 * Get wishlist data containing lightweight wishlist product IDs, cart product IDs, and count.
 * Route: POST /app-api/v1/get-wishlist-data
 */
export const getWishlistData = async (
  params: WishlistIdentityParams
): Promise<WishlistDataResponse> => {
  const body = buildIdentityPayload(params);

  const response = await apiClient.post<WishlistDataResponse>(
    "/app-api/v1/get-wishlist-data",
    body
  );

  return response.data;
};

/**
 * Get full user wishlist data with product details (for the Wishlist screen).
 * Route: POST /app-api/v1/get-user-wishlist-data
 */
export const getUserWishlistData = async (
  params: WishlistIdentityParams
): Promise<UserWishlistResponse> => {
  const body = buildIdentityPayload(params);

  const response = await apiClient.post<UserWishlistResponse>(
    "/app-api/v1/get-user-wishlist-data",
    body
  );

  return response.data;
};
