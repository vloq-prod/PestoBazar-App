import { apiClient } from "../lib/apiClient";
import { FreeProductResponse } from "../types/offer.types";

export const getFreeProducts = async (
  variationId: number,
): Promise<FreeProductResponse> => {
  const { data } = await apiClient.get<FreeProductResponse>(
    `/app-api/v1/products/${variationId}/free-products`,
  );

  return data;
};