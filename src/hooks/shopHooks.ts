import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getListing } from "../api/shop.api";
import { ListingItem, ListingParams } from "../types/shop.types";

export const useListing = (baseParams: Omit<ListingParams, "page_no">) => {
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<ListingItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const processedPages = useRef<Set<number>>(new Set());
  const [loadingMoreUI, setLoadingMoreUI] = useState(false);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["listing", baseParams, page],
    queryFn: () => getListing({ ...baseParams, page_no: page }),
    enabled: hasMore,
    staleTime: 1000 * 60 * 2,
  });

  // Reset on filter change
  useEffect(() => {
    setPage(1);
    setProducts([]);
    setHasMore(true);
    processedPages.current.clear();
  }, [JSON.stringify(baseParams)]);

  useEffect(() => {
    if (!data || processedPages.current.has(page)) return;

    const newItems = data.data?.data ?? [];

    // 🔥 DEBUG LOGS
    console.log("---- PAGINATION DEBUG ----");
    console.log("Page:", page);
    console.log("New Items Length:", newItems.length);
    console.log("Total Products (before):", products.length);
    console.log("Has More (before):", hasMore);
    console.log("Is Fetching:", isFetching);
    console.log("--------------------------");

    processedPages.current.add(page);

    if (newItems.length === 0) {
      setHasMore(false);
      return;
    }

    setProducts((prev) => {
      const updated = page === 1 ? newItems : [...prev, ...newItems];

      // 🔥 AFTER UPDATE LOG
      console.log("Total Products (after):", updated.length);

      return updated;
    });
  }, [data]);

  const loadMore = useCallback(() => {
    if (!isFetching && hasMore) {
      setLoadingMoreUI(true);
      setPage((prev) => prev + 1);
    }
  }, [isFetching, hasMore]);

  return {
    products,
    loading: isLoading && page === 1,
    loadingMore: isFetching && page > 1,
    hasMore,
    loadMore,
  };
};
