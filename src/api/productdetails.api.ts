import { apiClient } from "../lib/apiClient";
import { CustomerAlsoBoughtParams, CustomerAlsoBoughtResponse, DeliveryParams, DeliveryResponse, ProductDetailsParams, ProductDetailsResponse, ReviewsParams, ReviewsResponse, SaveRecentlyViewedParams, SaveRecentlyViewedResponse } from "../types/productdetails.types";




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



export const getProductReviews = async (
  params: ReviewsParams
): Promise<ReviewsResponse> => {
  const { product_id, page = 1 } = params;

  const response = await apiClient.get(
    `/app-api/v1/product-reviews`,
    {
      params: {
        product_id,
        page,
      },
    }
  );

  return response.data;
};



export const getEstimatedDelivery = async (
  params: DeliveryParams
): Promise<DeliveryResponse> => {
  const response = await apiClient.get(
    "/app-api/v1/get-estimated-delivery",
    {
      params: {
        selected_variation_id: params.selected_variation_id,
        pincode: params.pincode,
      },
    }
  );

  return response.data;
};




export const getCustomerAlsoBought = async (
  params: CustomerAlsoBoughtParams
): Promise<CustomerAlsoBoughtResponse> => {
  const { product_id } = params;

  const response = await apiClient.get(
    `/app-api/v1/get-customer-also-bought`,
    {
      params: {
        product_id,
      },
    }
  );

  return response.data;
};

export const saveRecentlyViewed = async (
  payload: SaveRecentlyViewedParams
): Promise<SaveRecentlyViewedResponse> => {
  const response = await apiClient.post(
    `/app-api/v1/save-recently-viewed`,
    payload
  );

  return response.data;
};