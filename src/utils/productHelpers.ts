

export const formatPrice = (price: string): string =>
  `₹ ${parseFloat(price).toLocaleString("en-IN")}`;

export const getDiscountPercent = (mrp: string, selling: string): number => {
  const m = parseFloat(mrp);
  const s = parseFloat(selling);
  if (!m || !s || m <= s) return 0;
  return Math.round(((m - s) / m) * 100);
};

export const resolveImages = (
  images?: string[],
  fallback?: string,
): string[] => {
  const filtered = images?.filter(Boolean) ?? [];
  if (filtered.length) return filtered;
  if (fallback) return [fallback];
  return [];
};


export const getDiscount = (mrp: number, selling: number): number | null => {
  if (!mrp || !selling || mrp <= selling) return null;
  return Math.round(((mrp - selling) / mrp) * 100);
};


export const shouldShowRating = (
  avgRating: string,
  totalReviews: number
): boolean => {
  const rating = parseFloat(avgRating);
  return rating > 0 && totalReviews > 0;
};