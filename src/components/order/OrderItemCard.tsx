import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Star, RotateCcw, ChevronUp, ChevronDown } from "lucide-react-native";

const IMAGE_BASE = "https://static-cdn.pestobazaar.com/";

const formatPrice = (price: any) => {
  if (price === undefined || price === null) return "0";
  const num = Number(price);
  if (isNaN(num)) return price;
  return num % 1 === 0 ? num.toString() : num.toFixed(2).replace(/\.?0+$/, "");
};

interface OrderProductItemProps {
  item: any;
  colors: any;
  font: any;
  spacing: any;
  isChild?: boolean;
  isLastChild?: boolean;
  children?: React.ReactNode;
  calculatedPrice?: string | number;
}

const OrderProductItem = ({
  item,
  colors,
  font,
  spacing,
  isChild = false,
  isLastChild = false,
  children,
  calculatedPrice,
}: OrderProductItemProps) => {
  const imageUri = item.main_image?.startsWith("http")
    ? item.main_image
    : IMAGE_BASE + item.main_image;

  const displayTotalAmount = formatPrice(calculatedPrice ?? item.total_amount);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "stretch",
        gap: spacing(14),
        paddingVertical: isChild ? spacing(12) : 0,
        paddingHorizontal: isChild ? spacing(14) : 0,
        borderBottomWidth: isChild && !isLastChild ? 1 : 0,
        borderBottomColor: colors.border,
      }}
    >
      {/* Left Column: Image */}
      <View
        style={{
          width: isChild ? 50 : 80,
          minHeight: isChild ? 50 : 80,
          borderRadius: isChild ? 8 : 12,
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
          style={{ width: isChild ? 44 : 72, height: isChild ? 44 : 72 }}
          contentFit="contain"
        />
      </View>

      {/* Right Column: Content */}
      <View style={{ flex: 1, gap: spacing(8) }}>
        {/* Row 1: Product Name */}
        <Text
          style={{
            fontFamily: "Poppins_500Medium",
            fontSize: font(isChild ? 11 : 12),
            color: colors.text,
            lineHeight: font(isChild ? 16 : 18),

          }}
          numberOfLines={1}
        >
          {item.product_name}
        </Text>

        {/* Row 2: Size, Qty (Left) & Price (Right) */}
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
              gap: spacing(8),
            }}
          >
            {item.size && (
              <>
                <Text
                  style={{
                    fontFamily: "Poppins_400Regular",
                    fontSize: font(isChild ? 9.5 : 11),
                    color: colors.textSecondary,
                  }}
                >
                  {item.size.toLowerCase().includes("combo pack") ? (
                    <Text style={{ color: colors.text, fontFamily: "Poppins_500Medium" }}>
                      {item.size}
                    </Text>
                  ) : (
                    <>
                      Size:{" "}
                      <Text style={{ color: colors.text, fontFamily: "Poppins_500Medium" }}>
                        {item.size}
                      </Text>
                    </>
                  )}
                </Text>
                <View
                  style={{
                    width: 1,
                    height: spacing(10),
                    backgroundColor: colors.border,
                  }}
                />
              </>
            )}

            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: font(isChild ? 9.5 : 11),
                color: colors.textSecondary,
              }}
            >
              Qty:{" "}
              <Text style={{ color: colors.text, fontFamily: "Poppins_500Medium" }}>
                {isChild ? item.pack : item.qty}
              </Text>
            </Text>
          </View>

          <Text
            style={{
              fontFamily: "Poppins_600SemiBold",
              fontSize: font(isChild ? 12 : 14),
              color: colors.text,
            }}
          >
            ₹{displayTotalAmount}
          </Text>
        </View>

        {/* Row 3: Action Buttons / Children */}
        {children && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing(8) }}>
            {children}
          </View>
        )}
      </View>
    </View>
  );
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
  
  const handlePress = () => {
    if (item.product_slug) {
      router.push({
        pathname: "(stack)/product/[id]",
        params: { id: "slug", product_slug: item.product_slug },
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
      {/* ── Main Item Row ─────────────────────────────────── */}
      <View style={{ flexDirection: "column" }}>
        <TouchableOpacity activeOpacity={0.7} onPress={handlePress}>
          <OrderProductItem
            item={item}
            colors={colors}
            font={font}
            spacing={spacing}
            calculatedPrice={comboPrice || undefined}
          >
          {/* Review Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: spacing(10),
              paddingVertical: spacing(5),
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              gap: spacing(6),
            }}
          >
            <Star size={11} color={colors.starColor} fill={colors.starColor} />
            <Text
              style={{
                fontFamily: "Poppins_600SemiBold",
                fontSize: font(10.5),
              }}
            >
              Review
            </Text>
          </TouchableOpacity>

          {/* Reorder Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: spacing(10),
              paddingVertical: spacing(5),
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              gap: spacing(6),
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

        </OrderProductItem>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OrderItemCard;
