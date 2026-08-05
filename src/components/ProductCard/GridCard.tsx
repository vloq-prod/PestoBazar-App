import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Plus, Minus, StarIcon } from "lucide-react-native";
import { ListingItem } from "../../types/shop.types";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { useRouter } from "expo-router";
import { useAppVisitorStore } from "../../store/auth";
import { useAddToCart, useProductQuantity } from "../../hooks/cartHooks";

interface Props {
  item: ListingItem;

  onAddToCart?: (item: ListingItem, qty: number) => void;
}

const formatMRP = (price: string | number) => {
  const num = Number(price);
  if (isNaN(num)) return String(price);
  return num % 1 === 0 ? num.toString() : num.toFixed(2);
};

const ListingGridCard: React.FC<Props> = ({ item, onAddToCart }) => {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();
  const router = useRouter();
  const { visitorId, userId } = useAppVisitorStore((s) => s);
  const { addToCart, loading } = useAddToCart();

  const qty = useProductQuantity(item.id);
  const [inputVal, setInputVal] = useState("1");

  React.useEffect(() => {
    setInputVal(qty === 0 ? "1" : String(qty));
  }, [qty]);

  // ✅ Clean calculations
  const price = Number(item.selling_price);
  const mrp = Number(item.mrp);

  const discountAmount = mrp > price ? Math.round(mrp - price) : null;

  const rating = Number(item.avg_rating);
  const showRating = rating > 0;

  const handleQtyInput = (val: string) => {
    setInputVal(val);
    const parsed = parseInt(val);
    if (!isNaN(parsed) && parsed > 0) {
      addToCart(
        {
          user_id: userId ?? 0,
          visitor_id: visitorId,
          product_id: item.id,
          qty: parsed,
        },
        {
          onError: () => {
            setInputVal(String(qty));
          },
        },
      );
    }
  };

  const getStarType = (index: number, rating: number) => {
    if (index <= Math.floor(rating)) return "full";
    if (index === Math.ceil(rating) && rating % 1 !== 0) return "half";
    return "empty";
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => {
        if (!item.id || isNaN(Number(item.id))) {
          router.push({
            pathname: "(stack)/product/[id]",
            params: {
              id: "slug",
              product_slug: (item as any).url || (item as any).product_url,
              product_name: item.product_name,
            },
          });
        } else {
          router.push({
            pathname: "(stack)/product/[id]",
            params: {
              id: item.id,
              product_name: item.product_name,
            },
          });
        }
      }}
      style={{
        flex: 1,
      }}
    >
      {/* ── BORDERED CONTAINER (Image, Divider, Off & ADD button) ── */}
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: spacing(10),
          backgroundColor: colors.surfaceElevated,
        }}
      >
        {/* Image Area */}
        <View
          style={{
            width: "100%",
            aspectRatio: 1.15,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fff",
            borderTopLeftRadius: spacing(9),
            borderTopRightRadius: spacing(9),
            overflow: "hidden",
          }}
        >
          <Image
            source={{ uri: item.image_path }}
            style={{
              width: "85%",
              height: "85%",
            }}
            contentFit="contain"
          />
        </View>

        {/* Divider line below the image */}
        <View
          style={{
            height: 1,
            backgroundColor: colors.border,
            width: "100%",
          }}
        />

        {/* Bottom row inside the bordered box */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingLeft: spacing(10),
            height: spacing(24),
            backgroundColor: colors.surfaceElevated,
            borderBottomLeftRadius: spacing(9),
            borderBottomRightRadius: spacing(9),
            position: "relative",
          }}
        >
          {/* Rating (Left) - Single star and rating number */}
          <View style={{ flex: 1 }}>
            {showRating && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing(3) }}>
                <StarIcon
                  size={spacing(10)}
                  color={colors.starColor}
                  fill={colors.starColor}
                />
                <Text
                  style={{
                    fontSize: font(10),
                    color: colors.text,
                    fontFamily: "Poppins_600SemiBold",
                    includeFontPadding: false,
                    textAlignVertical: "center",
                  }}
                >
                  {rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>

          {/* ADD / Stepper Controller (Right) */}
          <View
            style={{
              position: "absolute",
              right: -spacing(6),
              top: -spacing(3),
              width: qty === 0 ? spacing(30) : spacing(58), // Dynamic width
              height: spacing(30),
              zIndex: 10,
            }}
          >
            {qty === 0 ? (
              /* Simple ADD button */
              <TouchableOpacity
                activeOpacity={0.9}
                disabled={loading}
                onPress={(e) => {
                  e.stopPropagation();
                  addToCart({
                    user_id: userId ?? 0,
                    visitor_id: visitorId,
                    product_id: item.id,
                    qty: 1,
                  });
                  onAddToCart?.(item, 1);
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: spacing(8), // Square
                  borderWidth: 1.2,
                  borderColor: colors.primary,
                  backgroundColor: colors.background,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.15,
                  shadowRadius: 1.5,
                  elevation: 2,
                }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Plus size={spacing(14)} color={colors.primary} strokeWidth={3} />
                )}
              </TouchableOpacity>
            ) : (
              /* Inline stepper pill */
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.primary,
                  borderRadius: spacing(8),
                  width: "100%",
                  height: "100%",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.15,
                  shadowRadius: 1.5,
                  elevation: 2,
                }}
              >
                {/* Decrement */}
                <TouchableOpacity
                  disabled={loading}
                  onPress={(e) => {
                    e.stopPropagation();
                    const nextQty = qty <= 1 ? 0 : qty - 1;
                    addToCart({
                      user_id: userId ?? 0,
                      visitor_id: visitorId,
                      product_id: item.id,
                      qty: nextQty,
                    });
                    onAddToCart?.(item, nextQty);
                  }}
                  style={{
                    width: spacing(18),
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
                >
                  <Minus size={spacing(12)} color="#fff" strokeWidth={2.5} />
                </TouchableOpacity>

                {/* Qty input */}
                <TextInput
                  value={inputVal}
                  onChangeText={handleQtyInput}
                  keyboardType="number-pad"
                  editable={!loading}
                  style={{
                    flex: 1,
                    color: "#fff",
                    textAlign: "center",
                    fontSize: font(11),
                    fontFamily: "Poppins_600SemiBold",
                    padding: 0,
                    height: "100%",
                  }}
                />

                {/* Increment */}
                <TouchableOpacity
                  disabled={loading}
                  onPress={(e) => {
                    e.stopPropagation();
                    const nextQty = qty + 1;
                    addToCart({
                      user_id: userId ?? 0,
                      visitor_id: visitorId,
                      product_id: item.id,
                      qty: nextQty,
                    });
                    onAddToCart?.(item, nextQty);
                  }}
                  style={{
                    width: spacing(18),
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                >
                  <Plus size={spacing(12)} color="#fff" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* ── DETAILS SECTION BELOW THE BORDERED CONTAINER ── */}
      <View style={{ paddingTop: spacing(8), gap: spacing(1) }}>
        {/* Price row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing(8),
            marginTop: spacing(1),
          }}
        >
          {/* Selling Price 3D Pill */}
          <View
            style={{
              backgroundColor: colors.primary,
              borderRadius: spacing(8),
              paddingHorizontal: spacing(8),
              paddingVertical: spacing(4),
              borderWidth: 0, // No full border
              borderColor: colors.primaryDark || "#1e3a8a", // Darker shade of primary
              borderBottomWidth: 3, // 3D shadow offset only on bottom
              borderRightWidth: 2, // 3D shadow offset only on right
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: font(13),
                color: "#FFFFFF",
                fontFamily: "Poppins_700Bold",
                includeFontPadding: false,
                textAlign: "center",
                transform: [{ translateY: 0.8 }], // Offsets bottom border to center visually
              }}
            >
              ₹{formatMRP(item.selling_price)}
            </Text>
          </View>

          {/* MRP Price crossed out */}
          {discountAmount && (
            <Text
              style={{
                fontSize: font(13.5),
                color: colors.textSecondary,
                textDecorationLine: "line-through",
                fontFamily: "Poppins_400Regular",
                includeFontPadding: false,
              }}
            >
              ₹{formatMRP(item.mrp)}
            </Text>
          )}
        </View>

        {/* Off price below selling price and MRP */}
        {discountAmount && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: spacing(3),
              marginBottom: spacing(2),
            }}
          >
            <Text
              style={{
                fontSize: font(12),
                color: "#FF5E0E",
                fontFamily: "Poppins_700Bold",
                includeFontPadding: false,
              }}
            >
              ₹{discountAmount} OFF
            </Text>
            <View
              style={{
                flex: 1,
                borderStyle: "dashed",
                borderWidth: 1.2,
                borderColor: colors.border,
                borderRadius: 1,
                height: 0,
                marginLeft: spacing(8),
                opacity: 0.7,
              }}
            />
          </View>
        )}

        {/* Product name */}
        <Text
          numberOfLines={2}
          style={{
            fontSize: font(12),
            fontFamily: "Poppins_600SemiBold",
            color: colors.text,
            lineHeight: font(17),
            marginTop: spacing(1),
          }}
        >
          {item.product_name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(ListingGridCard);
