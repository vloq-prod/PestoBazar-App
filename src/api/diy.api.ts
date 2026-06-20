import { apiClient } from "../lib/apiClient";
import { DiyListingRequest, DiyListingResponse } from "../types/diy.types";

export const getDiyListing = async (
  payload: DiyListingRequest,
): Promise<DiyListingResponse> => {
  const response = await apiClient.post<DiyListingResponse>(
    "/app-api/v1/diy-listing",
    payload,
  );

  return response.data;
};
