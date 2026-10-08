import { apiClient } from "../lib/apiClient";
import {
  AddToCartRequest,
  AddToCartResponse,
  CartCountResponse,
  CartResponse,
  GetCartCountParams,
  GetQuickCartParams,
  QuickCartResponse,
  RemoveCartItemRequest,
  RemoveCartItemResponse,
} from "../types/cart.types";

export const addToCart = async (
  payload: AddToCartRequest,
): Promise<AddToCartResponse> => {
  const response = await apiClient.post<AddToCartResponse>(
    "/app-api/v1/add-to-cart",
    payload,
  );

  return response.data;
};

// src/api/cart.api.ts

interface GetCartParams {
  user_id?: number  | string;
  visitor_id: string;
}

export const getCart = async (
  params: GetCartParams
): Promise<CartResponse> => {
  const hasValidUserId = params.user_id && params.user_id !== 0 && params.user_id !== "0";
  const cleanParams = {
    visitor_id: params.visitor_id,
    ...(hasValidUserId ? { user_id: params.user_id } : {}),
  };
  const response = await apiClient.get<CartResponse>(
    "/app-api/v1/cart",
    { params: cleanParams }
  );

  return response.data;
};

export const getCartCount = async (
  params: GetCartCountParams,
): Promise<CartCountResponse> => {
  const hasValidUserId = params.user_id && params.user_id !== 0 && params.user_id !== "0";
  const cleanParams = {
    visitor_id: params.visitor_id,
    ...(hasValidUserId ? { user_id: params.user_id } : {}),
  };
  const response = await apiClient.get("/app-api/v1/cart-count", {
    params: cleanParams,
  });

  return response.data;
};

export const getQuickCart = async (
  params: GetQuickCartParams,
): Promise<QuickCartResponse> => {
  const hasValidUserId = params.user_id && params.user_id !== 0 && params.user_id !== "0";
  const cleanParams = {
    visitor_id: params.visitor_id,
    ...(hasValidUserId ? { user_id: params.user_id } : {}),
  };
  const response = await apiClient.get("/app-api/v1/quick-cart", {
    params: cleanParams,
  });

  return response.data;
};





export const removeCartItem = async (
  payload: RemoveCartItemRequest
): Promise<RemoveCartItemResponse> => {
  const response =
    await apiClient.post<RemoveCartItemResponse>(
      "/app-api/v1/remove",
      payload
    );

  return response.data;
};