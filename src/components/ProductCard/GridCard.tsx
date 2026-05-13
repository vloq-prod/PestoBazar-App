import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Plus, Minus, Trash2, StarIcon, Tag } from "lucide-react-native";
import { ListingItem } from "../../types/shop.types";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { useRouter } from "expo-router";
import { useAppVisitorStore } from "../../store/auth";
import { useAddToCart } from "../../hooks/cartHooks";

interface Props {
  item: ListingItem;

  onAddToCart?: (item: ListingItem, qty: number) => void;
}

const ListingGridCard: React.FC<Props> = ({ item, onAddToCart }) => {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();
  const router = useRouter();
  const { visitorId, userId } = useAppVisitorStore((s) => s);
  const { addToCart, loading } = useAddToCart();

  const [qty, setQty] = useState(0);
  const [inputVal, setInputVal] = useState("1");

  // ✅ Clean calculations
  const price = Number(item.selling_price);
  const mrp = Number(item.mrp);

  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : null;

  // Format: hide .00, keep meaningful decimals like .06
  const formatPrice = (val: number) => {
    const fixed = val.toFixed(2);
    return fixed.endsWith(".00") ? String(Math.trunc(val)) : fixed;
  };

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
          onSuccess: (data) => {
            if (data.status === 1) {
              setQty(parsed);
            } else {
              setInputVal(String(qty));
            }
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
      onPress={() =>
        router.push({
          pathname: "(stack)/product/[id]",
          params: {
            id: item.id,
            product_name: item.product_name,
          },
        })
      }
      style={{
        flex: 1,
      }}
    >
      {/* IMAGE BLOCK WIHT FLOATING*/}
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: spacing(14),
          overflow: "hidden",
          backgroundColor: colors.surfaceElevated,
        }}
      >
        <Image
          source={{ uri: item.image_path }}
          style={{
            width: "90%",

            aspectRatio: 1,
          }}
          contentFit="contain"
        />

        {discount && (
          <View
            style={{
              position: "absolute",
              top: spacing(8),
              left: spacing(8),
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: spacing(8),
              height: spacing(22),
              borderRadius: spacing(7),
              backgroundColor: colors.saleRed,
            }}
          >
            <Tag
              size={spacing(10)}
              color={colors.textInverse}
              strokeWidth={2.2}
            />

            <Text
              style={{
                marginLeft: spacing(4),
                fontSize: font(10),
                color: colors.textInverse,
                fontFamily: "Poppins_600SemiBold",
                includeFontPadding: false,
                textAlignVertical: "center",
              }}
            >
              {discount}%
            </Text>
          </View>
        )}

        {/* ── FLOATING CART CONTROL — bottom right of image ── */}
        <View
          style={{
            position: "absolute",
            bottom: spacing(6),
            right: spacing(6),
          }}
        >
          {qty === 0 ? (
            /* Single + button */
            <TouchableOpacity
              activeOpacity={0.9}
              disabled={loading}
              onPress={() => {
                const newQty = 1;
                addToCart(
                  {
                    user_id: userId ?? 0,
                    visitor_id: visitorId,
                    product_id: item.id,
                    qty: newQty,
                  },
                  {
                    onSuccess: (data) => {
                      if (data.status === 1) {
                        setQty(newQty);
                        setInputVal("1");
                      }
                    },
                  },
                );
                onAddToCart?.(item, newQty);
              }}
              style={{
                minWidth: spacing(42),
                height: spacing(30),
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: spacing(5),
                borderRadius: spacing(10),
                borderWidth: 1,
                borderColor: colors.primary,
                backgroundColor: colors.background,
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Text
                    style={{
                      color: colors.primary,
                      fontFamily: "Poppins_600SemiBold",
                      fontSize: font(10),
                      textTransform: "uppercase",
                      letterSpacing: 0.6,
                      includeFontPadding: false,
                    }}
                  >
                    Add
                  </Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            /* Inline stepper pill */
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.primary,
                borderRadius: spacing(10),
                height: spacing(30),
              }}
            >
              {/* Decrement / Trash */}
              <TouchableOpacity
                disabled={loading}
                onPress={() => {
                  const nextQty = qty <= 1 ? 0 : qty - 1;
                  addToCart(
                    {
                      user_id: userId ?? 0,
                      visitor_id: visitorId,
                      product_id: item.id,
                      qty: nextQty,
                    },
                    {
                      onSuccess: (data) => {
                        if (data.status === 1) {
                          setQty(nextQty);
                          setInputVal(nextQty === 0 ? "1" : String(nextQty));
                        }
                      },
                    },
                  );
                  onAddToCart?.(item, nextQty);
                }}
                style={{
                  width: spacing(30),
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
              >
                {qty === 1 ? (
                  <Trash2 size={spacing(13)} color="#fff" />
                ) : (
                  <Minus size={spacing(13)} color="#fff" strokeWidth={2.5} />
                )}
              </TouchableOpacity>

              {/* Qty input */}
              <TextInput
                value={inputVal}
                onChangeText={handleQtyInput}
                keyboardType="number-pad"
                editable={!loading}
                style={{
                  color: "#fff",
                  textAlign: "center",
                  fontSize: font(12),
                  fontFamily: "Poppins_600SemiBold",
                  minWidth: spacing(22),
                  padding: 0,
                  height: "100%",
                }}
              />

              {/* Increment */}
              <TouchableOpacity
                disabled={loading}
                onPress={() => {
                  const nextQty = qty + 1;
                  addToCart(
                    {
                      user_id: userId ?? 0,
                      visitor_id: visitorId,
                      product_id: item.id,
                      qty: nextQty,
                    },
                    {
                      onSuccess: (data) => {
                        if (data.status === 1) {
                          setQty(nextQty);
                          setInputVal(String(nextQty));
                        }
                      },
                    },
                  );
                  onAddToCart?.(item, nextQty);
                }}
                style={{
                  width: spacing(30),
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
              >
                <Plus size={spacing(13)} color="#fff" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View style={{ paddingTop: spacing(3) }}>
        {/* price */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing(4),
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
            ₹{formatPrice(price)}
          </Text>

          {discount && (
            <Text
              style={{
                fontSize: font(9),
                color: colors.textTertiary,
                textDecorationLine: "line-through",
                fontFamily: "Poppins_400Regular",
                includeFontPadding: false,
              }}
            >
              ₹{formatPrice(mrp)}
            </Text>
          )}
        </View>

        {/* name */}
        <Text
          numberOfLines={2}
          style={{
            fontSize: font(11),
            fontFamily: "Poppins_500Medium",
            color: colors.text,
            marginTop: spacing(1),
            lineHeight: font(16),
          }}
        >
          {item.product_name}
        </Text>

        {showRating && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing(3),
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {[1, 2, 3, 4, 5].map((i) => {
                const type = getStarType(i, rating);
                return (
                  <StarIcon
                    key={i}
                    size={spacing(9)}
                    color={type === "empty" ? colors.border : colors.starColor}
                    fill={
                      type === "full"
                        ? colors.starColor
                        : type === "half"
                          ? colors.starColor
                          : "none"
                    }
                    style={type === "half" ? { opacity: 0.5 } : {}}
                  />
                );
              })}
            </View>

            {rating > 0 && (
              <Text
                style={{
                  fontSize: font(10),
                  marginTop: spacing(1),
                  color: colors.textTertiary,
                  fontFamily: "Poppins_400Regular",
                }}
              >
                {rating.toFixed(1)}
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(ListingGridCard);
