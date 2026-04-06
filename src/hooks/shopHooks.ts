import { useCallback, useMemo } from "react";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { getListing } from "../api/shop.api";
import {
  ListingApiResponse,
  ListingItem,
  ListingParams,
} from "../types/shop.types";

const PAGE_SIZE = 16;

export const useListing = (baseParams: Omit<ListingParams, "page_no">) => {
  const query = useInfiniteQuery<
    ListingApiResponse,
    Error,
    InfiniteData<ListingApiResponse>,
    [string, Omit<ListingParams, "page_no">],
    number
  >({
    queryKey: ["listing", baseParams],
    initialPageParam: 1,

    queryFn: ({ pageParam }) =>
      getListing({ ...baseParams, page_no: pageParam }),

    getNextPageParam: (lastPage, pages) => {
      const newItems = lastPage?.data?.data ?? [];
      return newItems.length < PAGE_SIZE ? undefined : pages.length + 1;
    },

    staleTime: 1000 * 60 * 2,
  });

  // ✅ FLATTEN DATA (NO STATE)
  const products: ListingItem[] = useMemo(() => {
    return (
      query.data?.pages.flatMap(
        (page: ListingApiResponse) => page?.data?.data ?? [],
      ) ?? []
    );
  }, [query.data]);

  // ✅ LOAD MORE
  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [query]);

  return {
    products,
    loading: query.isLoading,
    loadingMore: query.isFetchingNextPage,
    hasMore: query.hasNextPage,
    allLoaded: !query.hasNextPage && products.length > 0,
    loadMore,
  };
};
