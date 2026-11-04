import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Star, RotateCcw } from "lucide-react-native";
import { getImageUrl } from "../../utils/imageUtils";

const formatPrice = (price: any) => {
  if (price === undefined || price === null) return "0";
  const num = Number(price);
  if (isNaN(num)) return price;
  return num % 1 === 0 ? num.toString() : num.toFixed(2).replace(/\.?0+$/, "");
};

const cartMoney = (val: any) => {
  const num = Number(val || 0);
  if (!Number.isFinite(num)) return "0.00";
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

interface OrderItemCardProps {
  item: any;
  orderData: any;
  isLast: boolean;
  colors: any;
  font: any;
  spacing: any;
}

const OrderItemCard = ({
  item,
  orderData,
  isLast,
  colors,
  font,
  spacing,
}: OrderItemCardProps) => {
  const router = useRouter();
  const isCombo = item.listing_type === "Combo";

  const isB2B = Boolean(
    orderData?.order?.b2b_order == 1 ||
    orderData?.order?.b2b_order === "1" ||
    orderData?.order?.b2b_order === true ||
    item.price_exclusive_gst_amount !== undefined
  );

  const imageUri = getImageUrl(item.main_image || item.s3_image_path);

  // B2B Pricing Calculations
  const taxPercent = Number(item.tax_percent ?? item.gst ?? 18);
  const qty = Math.max(1, Number(item.qty || 1));
  const totalAmount = Number(item.total_amount || 0);
  
  const priceExclusiveGstAmount = Number(
    item.price_exclusive_gst_amount !== undefined && Number(item.price_exclusive_gst_amount) > 0
      ? item.price_exclusive_gst_amount
      : totalAmount / (1 + taxPercent / 100)
  );

  const discountPercentage = Number(
    item.discount_percentage !== undefined && item.discount_percentage !== null
      ? item.discount_percentage
      : orderData?.order?.b2b_discount_percent ?? 0
  );

  const discountedAmount = Number(
    item.discounted_amount !== undefined && Number(item.discounted_amount) > 0
      ? item.discounted_amount
      : priceExclusiveGstAmount * (discountPercentage / 100)
  );

  const taxableAmount = Number(
    item.post_discount_amount !== undefined && Number(item.post_discount_amount) > 0
      ? item.post_discount_amount
      : priceExclusiveGstAmount - discountedAmount
  );

  const gstAmount = Number(
    item.igst_amount !== undefined && Number(item.igst_amount) > 0
      ? item.igst_amount
      : taxableAmount * (taxPercent / 100)
  );

  const finalTotal = taxableAmount + gstAmount;

  const handlePress = () => {
    const slugStr = item.product_slug || item.slug;
    const prodId = item.product_id || item.productId;
    const varId = item.variation_id || item.variant_id;
    const targetId = varId || prodId;
    if (slugStr || targetId) {
      router.push({
        pathname: "/(stack)/products/[slug]",
        params: {
          slug: slugStr || "product",
          ...(targetId ? { id: targetId } : {}),
          ...(varId ? { variation_id: varId } : {}),
          product_name: item.product_name || item.name || "",
        },
      });
    }
  };

  const handleReviewPress = () => {
    const slugStr = item.product_slug || item.slug;
    const prodId = item.product_id || item.productId;
    const varId = item.variation_id || item.variant_id;
    const targetId = varId || prodId;
    if (slugStr || targetId) {
      router.push({
        pathname: "/(stack)/products/[slug]",
        params: {
          slug: slugStr || "product",
          ...(targetId ? { id: targetId } : {}),
          ...(varId ? { variation_id: varId } : {}),
          product_name: item.product_name || item.name || "",
          scrollToReview: "true",
        },
      });
    }
  };

  const comboPrice = React.useMemo(() => {
    if (!isCombo) return null;
    const children = (orderData?.order_combo_detail || []).filter(
      (child: any) => child.parent_variant_id === item.variation_id
    );
    if (children.length === 0) return null;
    return children.reduce(
      (acc: number, child: any) => acc + Number(child.total_amount || 0),
      0
    );
  }, [isCombo, item.variation_id, orderData?.order_combo_detail]);

  const displayTotalAmount = formatPrice(comboPrice ?? item.total_amount);

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        paddingBottom: spacing(16),
        marginBottom: isLast ? 0 : spacing(16),
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      {/* ── Product Header Row ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: spacing(12),
        }}
      >
        {/* Thumbnail */}
        <TouchableOpacity activeOpacity={0.7} onPress={handlePress}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 10,
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={{ uri: imageUri }}
              style={{ width: 64, height: 64 }}
              contentFit="contain"
            />
          </View>
        </TouchableOpacity>

        {/* Info Column */}
        <View style={{ flex: 1, gap: spacing(6) }}>
          {/* Title */}
          <TouchableOpacity activeOpacity={0.7} onPress={handlePress}>
            <Text
              style={{
                fontFamily: "Poppins_500Medium",
                fontSize: font(12.5),
                color: colors.text,
                lineHeight: font(17),
              }}
              numberOfLines={2}
            >
              {item.product_name || item.name}
            </Text>
          </TouchableOpacity>

          {/* Size & Qty Chips */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing(6),
                flexWrap: "wrap",
              }}
            >
              {item.size ? (
                <View
                  style={{
                    backgroundColor: colors.backgroundgray,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins_400Regular",
                      fontSize: font(10.5),
                      color: colors.text,
                    }}
                  >
                    {item.size}
                  </Text>
                </View>
              ) : null}

              <View
                style={{
                  backgroundColor: colors.backgroundgray,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Poppins_500Medium",
                    fontSize: font(10.5),
                    color: colors.text,
                  }}
                >
                  × {item.qty}
                </Text>
              </View>
            </View>

            {/* If Retail (B2C), show price here */}
            {!isB2B && (
              <Text
                style={{
                  fontFamily: "Poppins_600SemiBold",
                  fontSize: font(14),
                  color: colors.text,
                }}
              >
                ₹{displayTotalAmount}
              </Text>
            )}
          </View>

          {/* Action Buttons: Review & Reorder */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing(8),
              marginTop: spacing(2),
            }}
          >
            {/* Review Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleReviewPress}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: spacing(10),
                paddingVertical: spacing(4),
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 7,
                backgroundColor: colors.surface,
                gap: spacing(5),
              }}
            >
              <Star size={11} color={colors.starColor} fill={colors.starColor} />
              <Text
                style={{
                  fontFamily: "Poppins_600SemiBold",
                  fontSize: font(10.5),
                  color: colors.text,
                }}
              >
                Review
              </Text>
            </TouchableOpacity>

            {/* Reorder Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handlePress}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: spacing(10),
                paddingVertical: spacing(4),
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 7,
                gap: spacing(5),
              }}
            >
              <RotateCcw size={11} color={colors.textSecondary} />
              <Text
                style={{
                  fontFamily: "Poppins_600SemiBold",
                  fontSize: font(10.5),
                  color: colors.text,
                }}
              >
                Reorder
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── B2B Breakdown Card (Web Style) ── */}
      {isB2B && (
        <View
          style={{
            marginTop: spacing(10),
            backgroundColor: colors.backgroundgray,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing(10),
            gap: spacing(6),
          }}
        >
          {/* 1. Price (Excl. GST) */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: font(11),
                color: colors.textSecondary,
              }}
            >
              Price (Excl. GST)
            </Text>
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  fontFamily: "Poppins_600SemiBold",
                  fontSize: font(12.5),
                  color: colors.text,
                }}
              >
                ₹{cartMoney(priceExclusiveGstAmount)}
              </Text>
              {qty > 1 && (
                <Text
                  style={{
                    fontFamily: "Poppins_400Regular",
                    fontSize: font(9.5),
                    color: colors.textSecondary,
                    marginTop: 1,
                  }}
                >
                  ₹{cartMoney(priceExclusiveGstAmount / qty)} / unit
                </Text>
              )}
            </View>
          </View>

          {/* 2. Discount & Taxable Amount (if discount applicable) */}
          {discountPercentage > 0 && (
            <>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Poppins_500Medium",
                    fontSize: font(11),
                    color: "#10B981",
                  }}
                >
                  Discount ({discountPercentage}%)
                </Text>
                <Text
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: font(12.5),
                    color: "#10B981",
                  }}
                >
                  -₹{cartMoney(discountedAmount)}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Poppins_400Regular",
                    fontSize: font(11),
                    color: colors.textSecondary,
                  }}
                >
                  Taxable Amount
                </Text>
                <Text
                  style={{
                    fontFamily: "Poppins_500Medium",
                    fontSize: font(12),
                    color: colors.text,
                  }}
                >
                  ₹{cartMoney(taxableAmount)}
                </Text>
              </View>
            </>
          )}

          {/* 3. GST */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: font(11),
                color: colors.textSecondary,
              }}
            >
              GST ({taxPercent}%)
            </Text>
            <Text
              style={{
                fontFamily: "Poppins_500Medium",
                fontSize: font(12),
                color: colors.textSecondary,
              }}
            >
              +₹{cartMoney(gstAmount)}
            </Text>
          </View>

          {/* Divider */}
          <View
            style={{
              height: 1,
              backgroundColor: colors.border,
              marginVertical: spacing(2),
            }}
          />

          {/* 4. TOTAL */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "Poppins_700Bold",
                fontSize: font(12),
                color: colors.text,
              }}
            >
              TOTAL
            </Text>
            <Text
              style={{
                fontFamily: "Poppins_700Bold",
                fontSize: font(13.5),
                color: colors.text,
              }}
            >
              ₹{cartMoney(finalTotal)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default OrderItemCard;
