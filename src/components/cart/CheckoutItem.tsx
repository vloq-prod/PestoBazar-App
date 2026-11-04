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
      String(item.is_b2b_user || "").toLowerCase() === "yes" ||
      item.price_exclusive_gst !== undefined);

  const itemDiscountPercent = parseFloat(String(item.discount_percentage || 0));
  const hasB2BDiscount = itemDiscountPercent > 0;

  const cartMoney = (val: any) => {
    const num = Number(val || 0);
    if (!Number.isFinite(num)) return "0.00";
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

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
            {/* Size + Qty */}
            <Text
              style={{
                fontSize: font(11.5),
                fontFamily: "Poppins_400Regular",
                color: colors.textSecondary,
              }}
            >
              {item.size ? `${item.size}  ·  ` : ""}
              <Text
                style={{
                  fontFamily: "Poppins_500Medium",
                  color: colors.textSecondary,
                }}
              >
                Qty: {item.qty}
              </Text>
            </Text>

            {/* Price */}
            <View style={{ alignItems: "flex-end" }}>
              {isB2B ? (
                <>
                  <Text
                    style={{
                      fontSize: font(13.5),
                      fontFamily: "Poppins_700Bold",
                      color: colors.text,
                    }}
                  >
                    ₹{cartMoney(hasB2BDiscount ? item.post_discount_amount : (item.line_total_exclusive_gst || item.total_price))}
                  </Text>
                  <Text
                    style={{
                      fontSize: font(9),
                      fontFamily: "Poppins_500Medium",
                      color: colors.textSecondary,
                    }}
                  >
                    Excl. GST
                  </Text>
                </>
              ) : (
                <Text
                  style={{
                    fontSize: font(13.5),
                    fontFamily: "Poppins_600SemiBold",
                    color: colors.text,
                  }}
                >
                  ₹{fmt(item.total_price)}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* ── B2B Pricing Breakdown (Web Style) ── */}
      {isB2B && (
        <View
          style={{
            marginTop: spacing(4),
            marginBottom: spacing(8),
            backgroundColor: colors.backgroundgray,
            borderRadius: spacing(8),
            padding: spacing(8),
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            {/* 1. Price */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: font(10),
                  color: colors.textSecondary,
                  fontFamily: "Poppins_500Medium",
                }}
              >
                Price
              </Text>
              <Text
                style={{
                  fontSize: font(11),
                  color: colors.text,
                  fontFamily: "Poppins_600SemiBold",
                  marginTop: 2,
                }}
              >
                ₹{cartMoney(item.price_exclusive_gst ?? item.price_per_piece)}{" "}
                <Text
                  style={{
                    fontSize: font(8),
                    color: colors.textSecondary,
                    fontFamily: "Poppins_400Regular",
                  }}
                >
                  Excl. GST
                </Text>
              </Text>
              <Text
                style={{
                  fontSize: font(9),
                  color: colors.textTertiary,
                  fontFamily: "Poppins_400Regular",
                  marginTop: 1,
                }}
              >
                ₹{cartMoney(item.price_inclusive_gst ?? item.price_per_piece)} Incl. GST
              </Text>
            </View>

            {/* 2. Base Amount */}
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text
                style={{
                  fontSize: font(10),
                  color: colors.textSecondary,
                  fontFamily: "Poppins_500Medium",
                }}
              >
                Base Amount
              </Text>
              <Text
                style={{
                  fontSize: font(11),
                  color: colors.text,
                  fontFamily: "Poppins_600SemiBold",
                  marginTop: 2,
                }}
              >
                ₹{cartMoney(item.line_total_exclusive_gst ?? (Number(item.price_exclusive_gst ?? item.price_per_piece) * item.qty))}{" "}
                <Text
                  style={{
                    fontSize: font(8),
                    color: colors.textSecondary,
                    fontFamily: "Poppins_400Regular",
                  }}
                >
                  Excl. GST
                </Text>
              </Text>
              <Text
                style={{
                  fontSize: font(9),
                  color: colors.textTertiary,
                  fontFamily: "Poppins_400Regular",
                  marginTop: 1,
                }}
              >
                ₹{cartMoney(item.line_total_inclusive_gst ?? item.total_price)} Incl. GST
              </Text>
            </View>

            {/* 3. Total Amount / Discount */}
            <View style={{ flex: 1.1, alignItems: "flex-end" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text
                  style={{
                    fontSize: font(10),
                    color: colors.textSecondary,
                    fontFamily: "Poppins_500Medium",
                  }}
                >
                  Total Amount
                </Text>
                {hasB2BDiscount && (
                  <View
                    style={{
                      backgroundColor: "#10B98115",
                      paddingHorizontal: 4,
                      paddingVertical: 1,
                      borderRadius: 4,
                      borderWidth: 0.5,
                      borderColor: "#10B98140",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: font(8.5),
                        color: "#10B981",
                        fontFamily: "Poppins_700Bold",
                      }}
                    >
                      {itemDiscountPercent}%
                    </Text>
                  </View>
                )}
              </View>

              {hasB2BDiscount && (
                <Text
                  style={{
                    fontSize: font(9),
                    color: "#10B981",
                    fontFamily: "Poppins_600SemiBold",
                    marginTop: 2,
                  }}
                >
                  Discount: ₹{cartMoney(item.discounted_amount)}
                </Text>
              )}

              <Text
                style={{
                  fontSize: font(11.5),
                  color: colors.text,
                  fontFamily: "Poppins_700Bold",
                  marginTop: hasB2BDiscount ? 1 : 2,
                }}
              >
                ₹{cartMoney(hasB2BDiscount ? item.post_discount_amount : (item.line_total_exclusive_gst ?? item.total_price))}{" "}
                <Text
                  style={{
                    fontSize: font(8),
                    color: colors.textSecondary,
                    fontFamily: "Poppins_400Regular",
                  }}
                >
                  Excl. GST
                </Text>
              </Text>

              <Text
                style={{
                  fontSize: font(9),
                  color: colors.textTertiary,
                  fontFamily: "Poppins_400Regular",
                  marginTop: 1,
                }}
              >
                GST: ₹{cartMoney(hasB2BDiscount ? item.post_discount_gst_amount : item.gst_amount)}
              </Text>
            </View>
          </View>
        </View>
      )}

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