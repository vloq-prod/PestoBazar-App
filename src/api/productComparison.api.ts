import { apiClient } from "../lib/apiClient";
import { ProductComparisonResponse } from "../types/productComparison.types";


export const getProductComparison = async (
  variationId: number,
  userId?: string | number | null
): Promise<ProductComparisonResponse> => {
  const response = await apiClient.get<ProductComparisonResponse>(
    `/app-api/v1/product-comparisons/${variationId}`,
    {
      params: userId ? { user_id: userId } : undefined,
    }
  );

  return response.data;
};