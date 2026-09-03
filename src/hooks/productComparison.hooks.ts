import { useQuery } from "@tanstack/react-query";
import { getProductComparison } from "../api/productComparison.api";

export const productComparisonKeys = {
  all: ["product-comparison"] as const,

  detail: (variationId: number) =>
    [...productComparisonKeys.all, variationId] as const,
};

export const useProductComparison = (variationId?: number | string) => {
  const numericId = Number(variationId ?? 0);

  return useQuery({
    queryKey: productComparisonKeys.detail(numericId),
    queryFn: () => getProductComparison(numericId),
    enabled: Number.isFinite(numericId) && numericId > 0,
  });
};