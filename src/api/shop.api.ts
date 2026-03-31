import { apiClient } from "../lib/apiClient";
import { ListingApiResponse, ListingParams,  } from "../types/shop.types";

export const getListing = async (
  params: ListingParams
): Promise<ListingApiResponse> => {
  const response = await apiClient.get<ListingApiResponse>(
    "/app-api/v1/listing",
    {
      params: {
        ...params, 
      },
    }
  );

  return response.data;
};