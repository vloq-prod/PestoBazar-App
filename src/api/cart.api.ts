import { apiClient } from "../lib/apiClient";
import { AddToCartRequest, AddToCartResponse } from "../types/cart.types";

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
