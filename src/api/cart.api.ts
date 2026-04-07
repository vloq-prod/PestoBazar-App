import { apiClient } from "../lib/apiClient";
import {
  AddToCartRequest,
  AddToCartResponse,
  CartCountResponse,
  CartResponse,
  GetCartCountParams,
  GetQuickCartParams,
  QuickCartResponse,
} from "../types/cart.types";

export const addToCart = async (
  payload: AddToCartRequest,
): Promise<AddToCartResponse> => {
  console.log("🛒 ADD TO CART PAYLOAD:", payload);

  const response = await apiClient.post<AddToCartResponse>(
    "/app-api/v1/add-to-cart",
    payload,
  );

  console.log("🛒 ADD TO CART RESPONSE:", response.data);

  return response.data;
};

// src/api/cart.api.ts

interface GetCartParams {
  user_id?: number;
  visitor_id: string;
}

export const getCart = async (params: GetCartParams): Promise<CartResponse> => {
  const response = await apiClient.get("/app-api/v1/cart", {
    params,
  });

  return response.data;
};

export const getCartCount = async (
  params: GetCartCountParams,
): Promise<CartCountResponse> => {
  const response = await apiClient.get("/app-api/v1/cart-count", {
    params,
  });

  return response.data;
};

export const getQuickCart = async (
  params: GetQuickCartParams,
): Promise<QuickCartResponse> => {
  const response = await apiClient.get("/app-api/v1/quick-cart", {
    params,
  });

  return response.data;
};
