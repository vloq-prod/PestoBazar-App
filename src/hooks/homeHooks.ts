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
  registerDeviceToken,
  getAppMenuCategories,
  getHomepageSectionSequence,
  getAllAppBanners,
  getAppPopUpBanner,
} from "../api/home.api";
import {
  AppHeaderBannerItem,
  BulkEnquiryRequest,
  BulkEnquiryResponse,
  CategoryWithSubcategories,
  RegisterDeviceTokenRequest,
  SubmitRatingRequest,
  SubmitRatingResponse,
} from "../types/home.types";

// useBanner hook
export const useBanner = () => {
  const query = useQuery({
    queryKey: ["banners"],
    queryFn: getBanners,
    staleTime: 1000 * 60 * 30, // 30 mins
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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
    staleTime: 1000 * 60 * 30, // 30 mins
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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
    staleTime: 1000 * 60 * 30, // 30 mins
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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
    staleTime: 1000 * 60 * 30, // 30 mins
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    categories: query.data?.data?.category_master || [],
    mainCategory: query.data?.data?.main_category || [],
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
export const useHomeProduct = (userId?: string | null) => {
  const query = useQuery({
    queryKey: ["home-products", userId ?? "guest"],
    queryFn: () => getHomeProducts(userId ? { user_id: userId } : undefined),
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
    homeBottomBanners: banners?.home_bottom_banners ?? [],
  };
};

export const useDeals = (userId?: string | null) => {
  const query = useQuery({
    queryKey: ["deals-of-the-day", userId ?? "guest"],
    queryFn: () => getDealsOfTheDay(userId ? { user_id: userId } : undefined),
  });

  return {
    deals: query.data?.data || [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// useDealsListing hook
export const useDealsListing = (
  page_no: number = 1,
  page_size: number = 16,
  userId?: string | null,
) => {
  const query = useQuery({
    queryKey: ["deals-listing", page_no, page_size, userId ?? "guest"],
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

export const useFeatured = (userId?: string | null) => {
  const query = useQuery({
    queryKey: ["featured-products", userId ?? "guest"],
    queryFn: () =>
      getFeaturedProducts(userId ? { user_id: userId } : undefined),
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

export const useRecentlyViewed = (visitorId: string, userId?: string) => {
  const query = useQuery({
    queryKey: ["recently-viewed", visitorId, userId],

    queryFn: () =>
      getRecentlyViewed({
        visitor_id: visitorId,
        user_id: userId || "",
      }),

    enabled: !!(visitorId || userId),
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
  });
};

export const useSubmitRating = () => {
  return useMutation<SubmitRatingResponse, Error, SubmitRatingRequest>({
    mutationFn: submitRating,
  });
};

export const useRegisterDeviceToken = () => {
  return useMutation({
    mutationFn: (payload: RegisterDeviceTokenRequest) =>
      registerDeviceToken(payload),
  });
};

// useAppMenuCategories hook
export const useAppMenuCategories = () => {
  const query = useQuery({
    queryKey: ["app-menu-categories"],
    queryFn: getAppMenuCategories,
  });

  return {
    categories: query.data?.data?.categories || [],
    brands: query.data?.data?.brands || [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// useHomepageSectionSequence hook
export const useHomepageSectionSequence = () => {
  const query = useQuery({
    queryKey: ["homepage-section-sequence"],
    queryFn: getHomepageSectionSequence,
    staleTime: 1000 * 60 * 30, // 30 mins cache
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    sequence: query.data?.data || [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// useAllAppBanners hook (returns banners from /app-api/v1/app-banners)
export const useAllAppBanners = () => {
  const query = useQuery({
    queryKey: ["all-app-banners"],
    queryFn: getAllAppBanners,
    staleTime: 1000 * 60 * 30, // 30 mins
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const rawData: any = query.data?.data;

  // Support new format (separate arrays) with seamless fallback
  const slidingBanners: AppHeaderBannerItem[] =
    rawData?.home_sliding_banners ||
    rawData?.sliding_banners ||
    (Array.isArray(rawData?.data)
      ? rawData.data.filter((b: any) =>
          b.banner_type?.toLowerCase()?.includes("sliding"),
        )
      : Array.isArray(rawData)
        ? rawData.filter((b: any) =>
            b.banner_type?.toLowerCase()?.includes("sliding"),
          )
        : []);

  const featuredBanners: AppHeaderBannerItem[] =
    rawData?.featured_banners ||
    rawData?.featured_banner ||
    (Array.isArray(rawData?.data)
      ? rawData.data.filter((b: any) =>
          b.banner_type?.toLowerCase()?.includes("featured"),
        )
      : Array.isArray(rawData)
        ? rawData.filter((b: any) =>
            b.banner_type?.toLowerCase()?.includes("featured"),
          )
        : []);

  const homeBottomBanners: AppHeaderBannerItem[] =
    rawData?.home_bottom_banners ||
    (Array.isArray(rawData?.data)
      ? rawData.data.filter(
          (b: any) =>
            b.banner_type?.toLowerCase()?.includes("bottom") ||
            b.redirect?.toLowerCase()?.includes("home-bottom"),
        )
      : Array.isArray(rawData)
        ? rawData.filter(
            (b: any) =>
              b.banner_type?.toLowerCase()?.includes("bottom") ||
              b.redirect?.toLowerCase()?.includes("home-bottom"),
          )
        : []);

  const allBanners: AppHeaderBannerItem[] = Array.isArray(rawData?.data)
    ? rawData.data
    : Array.isArray(rawData)
      ? rawData
      : [...slidingBanners, ...featuredBanners, ...homeBottomBanners];

  return {
    banners: allBanners,
    slidingBanners,
    featuredBanners,
    homeBottomBanners,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// useAppPopUpBanner hook
export const useAppPopUpBanner = () => {
  const query = useQuery({
    queryKey: ["app-pop-up-banner"],
    queryFn: getAppPopUpBanner,
    staleTime: 1000 * 60 * 15, // 15 mins
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const allBanners = query.data?.data?.data || [];
  const activeBanners = allBanners.filter(
    (b: any) => b.active?.toLowerCase() === "yes" || b.active === 1 || !b.active,
  );
  const allPopupImages = activeBanners.flatMap(
    (b: any) => b.popup_images || [],
  );

  return {
    banners: allBanners,
    activeBanners,
    activeBanner: activeBanners[0] || null,
    popupImages: allPopupImages,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

