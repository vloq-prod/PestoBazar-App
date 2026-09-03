import { apiClient } from "../lib/apiClient";
import { ProductComparisonResponse } from "../types/productComparison.types";


export const getProductComparison = async (
  variationId: number
): Promise<ProductComparisonResponse> => {
  const response = await apiClient.get<ProductComparisonResponse>(
    `/app-api/v1/product-comparisons/${variationId}`
  );

  return response.data;
};