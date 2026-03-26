import { useQuery } from "@tanstack/react-query";
import { getBanners, getHomeCategories, getHomeProducts } from "../api/home.api";

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