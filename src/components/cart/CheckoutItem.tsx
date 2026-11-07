import React from "react";
import { View, Text, Image } from "react-native";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { getImageUrl } from "../../utils/imageUtils";


interface CheckoutItemProps {
  item: {
    id: number;
    name: string;
    size: string;
    qty: number;
    price_per_piece: string | number;
    actual_price: string | number;
    total_price: string | number;
    s3_image_path: string;
    is_b2b_user?: string;
    price_exclusive_gst?: number | string;
    price_inclusive_gst?: number | string;
    line_total_exclusive_gst?: number | string;
    line_total_inclusive_gst?: number | string;
    discount_percentage?: string | number;
    discounted_amount?: number | string;
    post_discount_amount?: number | string;
    post_discount_gst_amount?: number | string;
    gst_amount?: number | string;
    tax_percent?: number | string;
  };
  isB2B?: boolean;
  isLast?: boolean;
}

const fmt = (value: string | number) => {
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
};

const CheckoutItem = ({ item, isB2B: isB2BProp, isLast }: CheckoutItemProps) => {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();
  const imageSize = spacing(52);

  const isB2B =
    isB2BProp ??
    (item.is_b2b_user === "Yes" ||
      String(item.is_b2b_user || "").toLowerCase() === "yes");

  const itemDiscountPercent = parseFloat(String(item.discount_percentage || 0));
  const hasB2BDiscount = itemDiscountPercent > 0;

  const parsePrice = (value: string | number | undefined | null): number => {
    if (typeof value === "number") return value;
    if (!value) return 0;
    const cleaned = String(value).replace(/[^0-9.]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const cartMoney = (val: any) => {
    const num = Number(val || 0);
    if (!Number.isFinite(num)) return "0.00";
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const rawBaseAmount = hasB2BDiscount
    ? (item.post_discount_amount ?? item.line_total_exclusive_gst ?? item.total_price)
    : (item.line_total_exclusive_gst ?? (Number(item.price_exclusive_gst ?? item.price_per_piece) * item.qty));
  const baseAmount = parsePrice(rawBaseAmount);

  const rawGstAmount = hasB2BDiscount
    ? (item.post_discount_gst_amount ?? item.gst_amount)
    : (item.post_discount_gst_amount ?? item.gst_amount);
  const gstAmount = parsePrice(rawGstAmount);

  let gstRate = parseFloat(String(item.tax_percent || 0));
  if (gstRate <= 0 && baseAmount > 0 && gstAmount > 0) {
    gstRate = Math.round((gstAmount / baseAmount) * 100);
  }
  const gstRateStr =
    gstRate > 0
      ? gstRate % 1 === 0
        ? `${gstRate}%`
        : `${gstRate.toFixed(1)}%`
      : "0%";

  const itemQty = Number(item.qty) || 1;
  const unitPriceExclGst =
    item.price_exclusive_gst !== undefined && item.price_exclusive_gst !== null
      ? parsePrice(item.price_exclusive_gst)
      : (item as any).price_exclusive_gst_amount !== undefined && (item as any).price_exclusive_gst_amount !== null
      ? parsePrice((item as any).price_exclusive_gst_amount)
      : baseAmount > 0
      ? baseAmount / itemQty
      : parsePrice(item.price_per_piece);

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          gap: spacing(10),
          paddingTop: spacing(8),
          paddingBottom: spacing(8),
          alignItems: "center",
        }}
      >
        {/* ── Image ── */}
        <View
          style={{
            width: imageSize,
            height: imageSize,
            borderRadius: spacing(8),
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surfaceElevated,
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <Image
            source={{ uri: getImageUrl(item.s3_image_path) || undefined }}
            style={{ width: imageSize - spacing(4), height: imageSize - spacing(4) }}
            resizeMode="contain"
          />
        </View>

        {/* ── Content ── */}
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            gap: spacing(3),
          }}
        >
          {/* Name */}
          <Text
            numberOfLines={1}
            style={{
              fontSize: font(12.5),
              fontFamily: "Poppins_500Medium",
              color: colors.text,
            }}
          >
            {item.name}
          </Text>

          {/* Size · Qty + Price */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Size + Unit Price + Qty */}
            <Text
              style={{
                fontSize: font(11.5),
                fontFamily: "Poppins_400Regular",
                color: colors.textSecondary,
              }}
            >
              {item.size ? `${item.size}  ·  ` : ""}
              {isB2B ? `₹${cartMoney(unitPriceExclGst)}  ·  ` : ""}
              <Text
                style={{
                  fontFamily: "Poppins_500Medium",
                  color: colors.textSecondary,
                }}
              >
                Qty: {item.qty}
              </Text>
            </Text>

            {/* Price / Total & GST */}
            {isB2B ? (
              <View style={{ alignItems: "flex-end" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  {hasB2BDiscount && (
                    <View
                      style={{
                        backgroundColor: "#10B98115",
                        paddingHorizontal: 4,
                        paddingVertical: 1,
                        borderRadius: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: font(8.5),
                          color: "#10B981",
                          fontFamily: "Poppins_700Bold",
                        }}
                      >
                        {itemDiscountPercent}% OFF
                      </Text>
                    </View>
                  )}
                  <Text
                    style={{
                      fontSize: font(13.5),
                      fontFamily: "Poppins_700Bold",
                      color: colors.text,
                    }}
                  >
                    ₹{cartMoney(baseAmount)}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: font(10),
                    fontFamily: "Poppins_500Medium",
                    color: colors.textSecondary,
                    marginTop: 1,
                  }}
                >
                  + ₹{cartMoney(gstAmount)} GST ({gstRateStr})
                </Text>
              </View>
            ) : (
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={{
                    fontSize: font(13.5),
                    fontFamily: "Poppins_600SemiBold",
                    color: colors.text,
                  }}
                >
                  ₹{fmt(item.total_price)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Edge-to-Edge Divider */}
      <View
        style={{
          height: 1,
          backgroundColor: colors.border,
          marginHorizontal: -12,
        }}
      />
    </>
  );
};

export default React.memo(CheckoutItem);