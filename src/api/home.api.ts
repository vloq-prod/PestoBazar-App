import { apiClient } from "../lib/apiClient";
import { BannerApiResponse, CategoryApiResponse, DealsApiResponse, FeaturedApiResponse, HomeProductApiResponse } from "../types/home.types";


// banner api
export const getBanners = async (): Promise<BannerApiResponse> => {
  const response = await apiClient.get<BannerApiResponse>(
    "/app-api/v1/app-banner"
  );

  console.log("response: ", response.data)
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

export const getDealsOfTheDay = async (): Promise<DealsApiResponse> => {
  const response = await apiClient.get<DealsApiResponse>(
    "/app-api/v1/app-home-deals-of-the-day"
  );

  return response.data;
};


export const getFeaturedProducts = async (): Promise<FeaturedApiResponse> => {
  const response = await apiClient.get<FeaturedApiResponse>(
    "/app-api/v1/app-home-featured-day"
  );

  return response.data;
};