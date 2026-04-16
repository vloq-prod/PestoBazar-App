import { apiClient } from "../lib/apiClient";
import {
  BannerApiResponse,
  BranchApiResponse,
  CategoryApiResponse,
  DealsApiResponse,
  FeaturedApiResponse,
  GetRecentlyViewedParams,
  GetRecentlyViewedResponse,
  HomeProductApiResponse,
  TestimonialApiResponse,
  UspApiResponse,
} from "../types/home.types";

// banner api
export const getBanners = async (): Promise<BannerApiResponse> => {
  const response = await apiClient.get<BannerApiResponse>(
    "/app-api/v1/app-banner",
  );

  return response.data;
};

// categories api
export const getHomeCategories = async (
  id: number,
): Promise<CategoryApiResponse> => {
  const response = await apiClient.get<CategoryApiResponse>(
    `/app-api/v1/app-home-category?id=${id}`,
  );

  return response.data;
};

// home product api
export const getHomeProducts = async (): Promise<HomeProductApiResponse> => {
  const response = await apiClient.get<HomeProductApiResponse>(
    "/app-api/v1/app-home-product",
  );

  return response.data;
};

export const getDealsOfTheDay = async (): Promise<DealsApiResponse> => {
  const response = await apiClient.get<DealsApiResponse>(
    "/app-api/v1/app-home-deals-of-the-day",
  );

  return response.data;
};

export const getFeaturedProducts = async (): Promise<FeaturedApiResponse> => {
  const response = await apiClient.get<FeaturedApiResponse>(
    "/app-api/v1/app-home-featured-day",
  );

  return response.data;
};

// testimaonials
export const getTestimonials = async (): Promise<TestimonialApiResponse> => {
  const response = await apiClient.get<TestimonialApiResponse>(
    "/app-api/v1/app-testimonial",
  );

  return response.data;
};

export const getUsp = async (): Promise<UspApiResponse> => {
  const response = await apiClient.get<UspApiResponse>("/app-api/v1/app-usp");
  return response.data;
};

export const getBranches = async (): Promise<BranchApiResponse> => {
  const response = await apiClient.get<BranchApiResponse>(
    "/app-api/v1/app-branches",
  );

  return response.data;
};

export const getRecentlyViewed = async (
  params: GetRecentlyViewedParams,
): Promise<GetRecentlyViewedResponse> => {
  const res = await apiClient.get<GetRecentlyViewedResponse>(
    "/app-api/v1/get-recently-viewed",
    {
      params,
    },
  );

  return res.data;
};
