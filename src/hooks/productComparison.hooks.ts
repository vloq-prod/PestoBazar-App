import { useQuery } from "@tanstack/react-query";
import { getProductComparison } from "../api/productComparison.api";
import { useAppVisitorStore } from "../store/auth";

export const productComparisonKeys = {
  all: ["product-comparison"] as const,

  detail: (variationId: number, userId?: string | number | null) =>
    [...productComparisonKeys.all, variationId, userId ?? "guest"] as const,
};

export const useProductComparison = (
  variationId?: number | string,
  userId?: string | number | null
) => {
  const numericId = Number(variationId ?? 0);
  const storeUserId = useAppVisitorStore((state) => state.userId);
  const effectiveUserId = userId !== undefined ? userId : storeUserId;

  return useQuery({
    queryKey: productComparisonKeys.detail(numericId, effectiveUserId),
    queryFn: () => getProductComparison(numericId, effectiveUserId),
    enabled: Number.isFinite(numericId) && numericId > 0,
  });
};