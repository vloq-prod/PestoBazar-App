import { apiClient } from "../lib/apiClient";
import { BannerApiResponse, CategoryApiResponse, HomeProductApiResponse } from "../types/home.types";


// banner api
export const getBanners = async (): Promise<BannerApiResponse> => {
  const response = await apiClient.get<BannerApiResponse>(
    "/app-api/v1/app-banner"
  );

  return response.data;
};


// categories api
export const getHomeCategories = async (): Promise<CategoryApiResponse> => {
  const response = await apiClient.get<CategoryApiResponse>(
    "/app-api/v1/app-home-category"
  );

  return response.data;
};

// home product api
export const getHomeProducts = async (): Promise<HomeProductApiResponse> => {
  const response = await apiClient.get<HomeProductApiResponse>(
    "/app-api/v1/app-home-product"
  );

  return response.data;
};