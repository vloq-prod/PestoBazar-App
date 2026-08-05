import { useQuery } from "@tanstack/react-query";
import { getFreeProducts } from "../api/offer.api";

export const useFreeProducts = (variationId?: number) => {
  return useQuery({
    queryKey: ["free-products", variationId],
    queryFn: () => getFreeProducts(variationId!),
    enabled: !!variationId,
    staleTime: 1000 * 60 * 5,
  });
};