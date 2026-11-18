import type { ProductComparisonProduct } from "../types/productComparison.types";

export const getComparisonB2BPricing = (
  product?: ProductComparisonProduct | null,
  isUserB2B?: boolean
) => {
  if (!product) {
    return {
      isB2B: false,
      displayPrice: 0,
      mrp: 0,
      exclusivePrice: 0,
      inclusivePrice: 0,
      gstPercent: 0,
    };
  }

  const price = product.price;
  const isApiB2B =
    String(price?.is_b2b_user || "").toLowerCase() === "yes" ||
    String(product.is_b2b_user || "").toLowerCase() === "yes";
  const isB2B = Boolean(isUserB2B || isApiB2B);

  const displayPrice = Number(price?.display_price ?? price?.selling_price ?? 0);
  const mrp = Number(price?.mrp ?? 0);
  const gstPercent = Number(price?.gst_percent ?? 0);

  let rawExclusive = Number(
    price?.b2b_price_exclusive_gst ??
      price?.selling_price_exclusive_gst ??
      product.b2b_price_exclusive_gst ??
      product.selling_price_exclusive_gst ??
      0
  );

  let inclusivePrice = Number(
    price?.b2b_price_inclusive_gst ??
      price?.selling_price_inclusive_gst ??
      product.b2b_price_inclusive_gst ??
      product.selling_price_inclusive_gst ??
      displayPrice
  );

  let exclusivePrice = rawExclusive;

  if (isB2B) {
    // If backend gave retail price where exclusive == inclusive, or exclusive is 0,
    // and gstPercent > 0, calculate exclusive = inclusive / (1 + gstPercent / 100)
    if (
      exclusivePrice <= 0 ||
      (Math.abs(exclusivePrice - inclusivePrice) < 0.01 && gstPercent > 0)
    ) {
      if (inclusivePrice > 0 && gstPercent > 0) {
        exclusivePrice = inclusivePrice / (1 + gstPercent / 100);
      } else if (inclusivePrice > 0) {
        exclusivePrice = inclusivePrice;
      }
    }
  }

  return {
    isB2B,
    displayPrice,
    mrp,
    exclusivePrice,
    inclusivePrice,
    gstPercent,
  };
};

export const formatB2BExclusivePrice = (value: number) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return "—";
  const parts = num.toFixed(2).split(".");
  const whole = Number(parts[0]).toLocaleString("en-IN");
  const decimal = parts[1] || "00";
  return `₹${whole}.${decimal}`;
};

export const formatB2BInclusivePrice = (value: number) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return "—";
  return `₹${num.toLocaleString("en-IN", {
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatPrice = (value: number) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0
    ? `₹${num.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
    : "₹0";
};
