import { useQueries, useQuery } from "@tanstack/react-query";
import {
  getBanners,
  getBranches,
  getDealsOfTheDay,
  getFeaturedProducts,
  getHomeCategories,
  getHomeProducts,
  getRecentlyViewed,
  getTestimonials,
  getUsp,
} from "../api/home.api";
import { CategoryWithSubcategories } from "../types/home.types";

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
      subcategories: (
        subcategoryQueries[index]?.data?.data?.category_master ?? []
      )
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