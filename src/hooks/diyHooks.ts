import { useQuery } from "@tanstack/react-query";
import { getDiyListing } from "../api/diy.api";
import { DiyListingRequest } from "../types/diy.types";

export const useDiyListing = (params: DiyListingRequest) => {
  const query = useQuery({
    queryKey: ["diy-listing", params],
    queryFn: () => getDiyListing(params),
    staleTime: 1000 * 60 * 2,
  });

  return {
    products: query.data?.data?.data || [],
    banner: query.data?.data?.banner || null,
    totalCount: query.data?.data?.total_count || 0,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
