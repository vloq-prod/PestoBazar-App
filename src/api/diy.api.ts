import { apiClient } from "../lib/apiClient";
import { DiyListingRequest, DiyListingResponse } from "../types/diy.types";

export const getDiyListing = async (
  params?: DiyListingRequest,
): Promise<DiyListingResponse> => {
  const response = await apiClient.get<DiyListingResponse>(
    "/app-api/v1/diy-listing",
    { params }
  );

  return response.data;
};
