import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import {
  bulkEnquiryApi,
  getBanners,
  getBranches,
  getDealsOfTheDay,
  getDealsListing,
  getFeaturedProducts,
  getHomeCategories,
  getHomeProducts,
  getRecentlyViewed,
  getTestimonials,
  getUsp,
  getAppHeaderBanner,
  getAppMainBanner,
  submitRating,
} from "../api/home.api";
import {
  BulkEnquiryRequest,
  BulkEnquiryResponse,
  CategoryWithSubcategories,
  SubmitRatingRequest,
  SubmitRatingResponse,
} from "../types/home.types";

// useBanner hook
export const useBanner = () => {
  const query = useQuery({
    queryKey: ["banners"],
    queryFn: getBanners,
  });

  return {
    banners: query.data?.data || null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// useAppHeaderBanner hook
export const useAppHeaderBanner = () => {
  const query = useQuery({
    queryKey: ["app-header-banner"],
    queryFn: getAppHeaderBanner,
  });

  return {
    banners: query.data?.data?.data || [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// useAppMainBanner hook
export const useAppMainBanner = () => {
  const query = useQuery({
    queryKey: ["app-main-banner"],
    queryFn: getAppMainBanner,
  });

  return {
    banners: query.data?.data?.data || [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// useCategory hook
export const useCategory = (id: number) => {
  const query = useQuery({
    queryKey: ["home-categories", id],
    queryFn: () => getHomeCategories(id),
  });

  return {
    categories: query.data?.data?.category_master || [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useCategoryWithSubcategories = (rootId: number = 0) => {
  const mainCategoryQuery = useQuery({
    queryKey: ["home-categories", rootId],
    queryFn: () => getHomeCategories(rootId),
  });

  const mainCategories = mainCategoryQuery.data?.data?.category_master ?? [];

  const subcategoryQueries = useQueries({
    queries: mainCategories.map((mainCategory) => ({
      queryKey: ["home-categories", "subcategories", mainCategory.id],
      queryFn: () => getHomeCategories(mainCategory.id),
      enabled: !!mainCategory.id,
    })),
  });

  const categoriesWithSubcategories: CategoryWithSubcategories[] =
    mainCategories.map((mainCategory, index) => ({
      mainCategory,
      mainCategoryId: mainCategory.id,
      mainCategoryName: mainCategory.category_name,
      subcategories:
        subcategoryQueries[index]?.data?.data?.category_master ?? [],
    }));

  return {
    categories: mainCategories,
    categoriesWithSubcategories,
    loading:
      mainCategoryQuery.isLoading ||
      subcategoryQueries.some((query) => query.isLoading),
    error:
      mainCategoryQuery.error ??
      subcategoryQueries.find((query) => query.error)?.error ??
      null,
    refetch: async () => {
      await mainCategoryQuery.refetch();
      await Promise.all(subcategoryQueries.map((query) => query.refetch()));
    },
  };
};

// home product hook
export const useHomeProduct = () => {
  const query = useQuery({
    queryKey: ["home-products"],
    queryFn: getHomeProducts,
  });

  return {
    sections: query.data?.data || [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useHomeBanners = () => {
  const { banners, loading } = useBanner();

  return {
    loading,
    slidingbanners: banners?.sliding_banners ?? [],
    featureBanners: banners?.featured_banner ?? [],
    homeBottomBanners: banners?.home_bottom_banners?.[0] ?? [],
  };
};

export const useDeals = () => {
  const query = useQuery({
    queryKey: ["deals-of-the-day"],
    queryFn: getDealsOfTheDay,
  });

  return {
    deals: query.data?.data || [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// useDealsListing hook
export const useDealsListing = (page_no: number = 1, page_size: number = 16) => {
  const query = useQuery({
    queryKey: ["deals-listing", page_no, page_size],
    queryFn: () => getDealsListing(page_no, page_size),
  });

  return {
    banner: query.data?.data?.banner || null,
    deals: query.data?.data?.data || [],
    totalCount: query.data?.data?.total_count || 0,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useFeatured = () => {
  const query = useQuery({
    queryKey: ["featured-products"],
    queryFn: getFeaturedProducts,
  });

  return {
    featured: query.data?.data || [],
    loading: query.isLoading,
    error: query.error,
  };
};

export const useTestimonial = () => {
  const query = useQuery({
    queryKey: ["testimonials"],
    queryFn: getTestimonials,
    staleTime: 1000 * 60 * 5,
  });

  return {
    testimonials: query.data?.data || [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useUsp = () => {
  const query = useQuery({
    queryKey: ["usp"],
    queryFn: getUsp,
    staleTime: 1000 * 60 * 10,
  });

  return {
    uspList: query.data?.data || [],
    loading: query.isLoading,
  };
};

export const useBranch = () => {
  const query = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
    staleTime: 1000 * 60 * 10,
  });

  return {
    branches: query.data?.data || [],
    loading: query.isLoading,
    error: query.error,
  };
};

export const useRecentlyViewed = (visitorId: string) => {
  const query = useQuery({
    queryKey: ["recently-viewed", visitorId],

    queryFn: () =>
      getRecentlyViewed({
        visitor_id: visitorId,
        user_id: "",
      }),

    enabled: !!visitorId,
  });

  return {
    recentlyViewed: query.data?.data?.recently_viewed || [],
    loading: query.isLoading,
    error: query.error,
  };
};

export const useBulkEnquiry = () => {
  return useMutation<BulkEnquiryResponse, Error, BulkEnquiryRequest>({
    mutationFn: bulkEnquiryApi,

    onSuccess: (response) => {
      console.log("✅", response.message);
      console.log("Enquiry ID:", response.data.id);
    },

    onError: (error) => {
      console.log("❌", error.message);
    },
  });
};


export const useSubmitRating = () => {
  return useMutation<
    SubmitRatingResponse,
    Error,
    SubmitRatingRequest
  >({
    mutationFn: submitRating,
  });
};