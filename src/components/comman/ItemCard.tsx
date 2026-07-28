import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
  DimensionValue,
} from "react-native";
import { Image } from "expo-image";
import { Plus, Minus, StarIcon } from "lucide-react-native";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { ProductItem } from "../../types/home.types";
import { useRouter } from "expo-router";
import { useAppVisitorStore } from "../../store/auth";
import { useAddToCart, useProductQuantity } from "../../hooks/cartHooks";

export default function ItemCard({
  item,
  onAddToCart,
  onPress,
}: {
  item: ProductItem;
  onPress?: (item: any) => void;
  onAddToCart?: (item: ProductItem, qty: number) => void;
}) {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const router = useRouter();
  const { visitorId, userId } = useAppVisitorStore((s) => s);
  const { addToCart, loading } = useAddToCart();

  const qty = useProductQuantity(item.id);
  const [inputVal, setInputVal] = useState("1");

  React.useEffect(() => {
    setInputVal(qty === 0 ? "1" : String(qty));
  }, [qty]);

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

  const mrpVal = Number(item.mrp);
  const sellingPriceVal = Number(item.selling_price);
  const discountAmount = mrpVal > sellingPriceVal ? Math.round(mrpVal - sellingPriceVal) : null;

  const rating = Number(item.avg_rating);
  const showRating = rating > 0;

  // ── Add to cart action ──────────────────────────────────────
  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    addToCart({
      user_id: userId ?? 0,
      visitor_id: visitorId,
      product_id: item.id,
      qty: 1,
    });
    onAddToCart?.(item, 1);
  };

  const handleDecrement = (e: any) => {
    e.stopPropagation();
    const nextQty = qty <= 1 ? 0 : qty - 1;
    addToCart({
      user_id: userId ?? 0,
      visitor_id: visitorId,
      product_id: item.id,
      qty: nextQty,
    });
    onAddToCart?.(item, nextQty);
  };

  const handleIncrement = (e: any) => {
    e.stopPropagation();
    const nextQty = qty + 1;
    addToCart({
      user_id: userId ?? 0,
      visitor_id: visitorId,
      product_id: item.id,
      qty: nextQty,
    });
    onAddToCart?.(item, nextQty);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => {
        if (onPress) {
          onPress(item);
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
            source={{ uri: item.s3_image_path }}
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
              width: spacing(58),
              height: spacing(30),
              zIndex: 10,
            }}
          >
            {qty === 0 ? (
              /* Simple ADD button */
              <TouchableOpacity
                activeOpacity={0.9}
                disabled={loading}
                onPress={handleAddToCart}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: spacing(8),
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
                  <Text
                    style={{
                      color: colors.primary,
                      fontFamily: "Poppins_700Bold",
                      fontSize: font(11),
                      textTransform: "uppercase",
                      includeFontPadding: false,
                    }}
                  >
                    ADD
                  </Text>
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
                  onPress={handleDecrement}
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
                  onPress={handleIncrement}
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
            gap: spacing(4),
            marginTop: spacing(1),
          }}
        >
          <Text
            style={{
              fontSize: font(16),
              color: colors.text,
              fontFamily: "Poppins_700Bold",
              includeFontPadding: false,
            }}
          >
            ₹{Number(item.selling_price)}
          </Text>

          {discountAmount && (
            <Text
              style={{
                fontSize: font(9),
                color: colors.textSecondary,
                textDecorationLine: "line-through",
                fontFamily: "Poppins_400Regular",
                includeFontPadding: false,
              }}
            >
              ₹{item.mrp}
            </Text>
          )}
        </View>

        {/* Off price below selling price and MRP */}
        {discountAmount && (
          <Text
            style={{
              fontSize: font(10),
              color: "#FF5E0E",
              fontFamily: "Poppins_700Bold",
              includeFontPadding: false,
            }}
          >
            ₹{discountAmount} OFF
          </Text>
        )}

        {/* Product name */}
        <Text
          numberOfLines={2}
          style={{
            fontSize: font(12),
            fontFamily: "Poppins_600SemiBold",
            color: colors.text,
            lineHeight: font(17),
          }}
        >
          {item.product_name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── ItemCard Skeleton ─────────────────────────────────────────────
export function ItemCardSkeleton({ width }: { width?: DimensionValue }) {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const opacityAnim = React.useRef(new Animated.Value(0.4)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacityAnim]);

  return (
    <Animated.View
      style={{ width: width || "100%", flex: 1, opacity: opacityAnim }}
    >
      {/* ── BORDERED CONTAINER SKELETON ── */}
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: spacing(10),
          backgroundColor: colors.surfaceElevated,
        }}
      >
        {/* Main image placeholder */}
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
          <View
            style={{
              width: "80%",
              height: "80%",
              borderRadius: spacing(10),
              backgroundColor: colors.backgroundSkeleton,
            }}
          />
        </View>

        {/* Divider line skeleton */}
        <View
          style={{
            height: 1,
            backgroundColor: colors.border,
            width: "100%",
          }}
        />

        {/* Bottom row skeleton inside the box */}
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
          {/* Rating skeleton (Left) */}
          <View
            style={{
              width: spacing(30),
              height: spacing(13),
              borderRadius: spacing(3),
              backgroundColor: colors.backgroundSkeleton,
            }}
          />

          {/* ADD button skeleton */}
          <View
            style={{
              position: "absolute",
              right: -spacing(6),
              top: -spacing(3),
              width: spacing(58),
              height: spacing(30),
              borderRadius: spacing(8),
              backgroundColor: colors.backgroundSkeleton,
            }}
          />
        </View>
      </View>

      {/* ── CONTENT SKELETON BELOW IMAGE ── */}
      <View style={{ paddingTop: spacing(8), gap: spacing(2) }}>
        {/* Price row skeleton */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing(6),
            marginTop: spacing(1),
          }}
        >
          <View
            style={{
              width: "45%",
              height: font(16),
              borderRadius: spacing(4),
              backgroundColor: colors.backgroundSkeleton,
            }}
          />
          <View
            style={{
              width: "25%",
              height: font(10),
              borderRadius: spacing(4),
              backgroundColor: colors.backgroundSkeleton,
            }}
          />
        </View>

        {/* Off price skeleton */}
        <View
          style={{
            width: spacing(40),
            height: font(10),
            borderRadius: spacing(3),
            backgroundColor: colors.backgroundSkeleton,
          }}
        />

        {/* Product title skeleton lines */}
        <View
          style={{
            width: "90%",
            height: font(12),
            borderRadius: spacing(4),
            backgroundColor: colors.backgroundSkeleton,
          }}
        />
        <View
          style={{
            width: "65%",
            height: font(12),
            borderRadius: spacing(4),
            backgroundColor: colors.backgroundSkeleton,
          }}
        />
      </View>
    </Animated.View>
  );
}

ItemCard.Skeleton = ItemCardSkeleton;
