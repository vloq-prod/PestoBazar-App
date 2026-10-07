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
  totalReviews: number,
): boolean => {
  const rating = parseFloat(avgRating);
  return rating > 0 && totalReviews > 0;
};

export const fmt = (value: string | number) => {
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `₹${num % 1 === 0 ? num.toFixed(0) : num.toFixed(2)}`;
};

export const formatINR = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Strips HTML elements that have inline style `display: none` or `visibility: hidden`,
 * or a `hidden` attribute (commonly used for SEO keywords).
 */
export const cleanProductDescriptionHtml = (html?: string): string => {
  if (!html) return "";
  let res = html;

  // Regex matching style attributes with display:none or visibility:hidden
  const stylePattern =
    /style\s*=\s*(?:"[^"]*(?:display\s*:\s*none|visibility\s*:\s*hidden)[^"]*"|'[^']*(?:display\s*:\s*none|visibility\s*:\s*hidden)[^']*'|[^\s>]*(?:display\s*:\s*none|visibility\s*:\s*hidden)[^\s>]*)/i
      .source;

  // Paired tags: e.g. <h2 style="display:none;">...</h2> or <p hidden>...</p>
  const pairedRegex = new RegExp(
    "<([a-zA-Z0-9]+)\\b(?:[^>]*\\b" +
      stylePattern +
      "[^>]*|[^>]*\\bhidden\\b[^>]*)>[\\s\\S]*?<\\/\\1\\s*>",
    "gi"
  );

  // Self closing tags: e.g. <img style="display:none;" />
  const selfClosingRegex = new RegExp(
    "<[a-zA-Z0-9]+\\b(?:[^>]*\\b" +
      stylePattern +
      "[^>]*|[^>]*\\bhidden\\b[^>]*)\\/?>",
    "gi"
  );

  let prev = "";
  do {
    prev = res;
    res = res.replace(pairedRegex, "");
  } while (res !== prev);

  res = res.replace(selfClosingRegex, "");

  return res.replace(/(\r?\n\s*){2,}/g, "\n").trim();
};

