import { apiClient } from "../lib/apiClient";
import { ProductDetailsParams, ProductDetailsResponse } from "../types/productdetails.types";




export const getProductDetails = async (
  params: ProductDetailsParams
): Promise<ProductDetailsResponse> => {
  const response = await apiClient.get(
    `/app-api/v1/product-details`,
    {
      params,
    }
  );

  return response.data;
};