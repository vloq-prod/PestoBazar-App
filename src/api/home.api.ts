import { apiClient } from "../lib/apiClient";
import {
  BannerApiResponse,
  BranchApiResponse,
  BulkEnquiryRequest,
  BulkEnquiryResponse,
  CategoryApiResponse,
  DealsApiResponse,
  FeaturedApiResponse,
  GetRecentlyViewedParams,
  GetRecentlyViewedResponse,
  HomeProductApiResponse,
  TestimonialApiResponse,
  UspApiResponse,
  AppHeaderBannerApiResponse,
  AppMainBannerApiResponse,
} from "../types/home.types";

// banner api
export const getBanners = async (): Promise<BannerApiResponse> => {
  const response = await apiClient.get<BannerApiResponse>(
    "/app-api/v1/app-banner",
  );

  return response.data;
};

// app header banner api
export const getAppHeaderBanner = async (): Promise<AppHeaderBannerApiResponse> => {
  const response = await apiClient.get<AppHeaderBannerApiResponse>(
    "/app-api/v1/app-header-banner"
  );

  return response.data;
};

// app main banner api
export const getAppMainBanner = async (): Promise<AppMainBannerApiResponse> => {
  const response = await apiClient.get<AppMainBannerApiResponse>(
    "/app-api/v1/app-main-banner"
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

// Deals Listing API
export const getDealsListing = async (
  page_no: number = 1,
  page_size: number = 16
): Promise<any> => {
  const response = await apiClient.get<any>(
    `/app-api/v1/deals-of-the-day?page_no=${page_no}&page_size=${page_size}`
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

// Submit Bulk Enquiry API
export const bulkEnquiryApi = async (
  payload: BulkEnquiryRequest,
): Promise<BulkEnquiryResponse> => {
  const response = await apiClient.post<BulkEnquiryResponse>(
    "/app-api/v1/bulk-enquiry",
    payload,
  );

  return response.data;
};
