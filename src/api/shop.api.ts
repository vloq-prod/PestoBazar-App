import { apiClient } from "../lib/apiClient";
import {
  FilterResponse,
  ListingApiResponse,
  ListingParams,
} from "../types/shop.types";

export const getListing = async (
  params: ListingParams,
): Promise<ListingApiResponse> => {
  const response = await apiClient.get<ListingApiResponse>(
    "/app-api/v1/listing",
    {
      params: {
        ...params,
      },
    },
  );

  return response.data;
};

export const getFilterApi = async (): Promise<FilterResponse> => {
  const response = await apiClient.get<FilterResponse>(
    "/app-api/v1/app-filter",
  );

  return response.data;
};
