import { useQuery } from "@tanstack/react-query";
import { getBanners, getDealsOfTheDay, getFeaturedProducts, getHomeCategories, getHomeProducts, getTestimonials } from "../api/home.api";

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
export const useCategory = () => {
  const query = useQuery({
    queryKey: ["home-categories"],
    queryFn: getHomeCategories,
  });

  return {
    categories: query.data?.data?.category_master || [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
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


// testimonials
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