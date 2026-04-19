import { apiClient } from "../lib/apiClient";
import { SearchResponse } from "../types/search.types";


export const searchProductsApi = async (search: string) => {
  const response = await apiClient.get<SearchResponse>(
    `/app-api/v1/search?search=${search}`
  );

  return response.data;
};