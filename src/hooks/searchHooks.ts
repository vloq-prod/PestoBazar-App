// hooks/useSearchSuggestions.ts

import { useQuery } from "@tanstack/react-query";
import { searchProductsApi } from "../api/search.api";

export const useSearchSuggestions = (search: string) => {
  return useQuery({
    queryKey: ["search-suggestions", search],
    queryFn: () => searchProductsApi(search),
    enabled: !!search,
    staleTime: 1000 * 60 * 5,
  });
};
