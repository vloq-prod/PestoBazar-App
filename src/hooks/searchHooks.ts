// hooks/useSearchSuggestions.ts

import { useQuery } from "@tanstack/react-query";
import { searchProductsApi } from "../api/search.api";
import { trackSearch } from "../lib/analytics";
import { useEffect } from "react";

export const useSearchSuggestions = (search: string) => {
  // Trigger Firebase Analytics for each search term (minimum 2 characters)
  useEffect(() => {
    if (search && search.trim().length >= 2) {
      trackSearch(search.trim());
    }
  }, [search]);

  return useQuery({
    queryKey: ["search-suggestions", search],
    queryFn: () => searchProductsApi(search),
    enabled: !!search,
    staleTime: 1000 * 60 * 5,
  });
};
