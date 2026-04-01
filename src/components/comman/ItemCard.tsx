import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useTheme } from "../../theme";
import { useState, useRef } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  StarIcon,
  Tag,
} from "lucide-react-native";

const CARD_WIDTH = (Dimensions.get("window").width - 16 * 2 - 12) / 2;
const OS = Platform.OS === "android";

export interface ItemData {
  id: number;
  slug: string;
  product_name: string;
  selling_price: string;
  mrp: string;
  avg_rating: string;
  total_reviews: number;
  s3_image_path: string;
  overview?: string;
}

interface Props {
  item: ItemData;
  onPress?: (item: ItemData) => void;
  onAddToCart?: (item: ItemData) => void;
}

const getDiscount = (mrp: string, selling: string) => {
  const m = parseFloat(mrp);
  const s = parseFloat(selling);
  if (!m || !s || m <= s) return null;
  return Math.round(((m - s) / m) * 100);
};

export default function ItemCard({ item, onPress, onAddToCart }: Props) {
  const { colors } = useTheme();
  const discount = getDiscount(item.mrp, item.selling_price);
  const rating = parseFloat(item.avg_rating);
  const [qty, setQty] = useState(0);
  const [inputVal, setInputVal] = useState("1");
  const inputRef = useRef<TextInput>(null);

  const handleQtyInput = (val: string) => {
    setInputVal(val);
    const parsed = parseInt(val);
    if (!isNaN(parsed) && parsed > 0) setQty(parsed);
  };

  const handleInputBlur = () => {
    const parsed = parseInt(inputVal);
    if (isNaN(parsed) || parsed <= 0) {
      setQty(0);
      setInputVal("1");
    } else {
      setQty(parsed);
      setInputVal(String(parsed));
    }
  };

  const AddButton = (
    <TouchableOpacity
      onPress={(e) => {
        e.stopPropagation();
        setQty(1);
        setInputVal("1");
        onAddToCart?.(item);
      }}
      activeOpacity={0.82}
      style={{
        backgroundColor: colors.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 10,
        borderRadius: 12,
      }}
    >
      <ShoppingCart size={14} color="#fff" strokeWidth={2.5} />
      <Text
        style={{
          color: "#fff",
          fontFamily: "Poppins_500Medium",
          fontSize: 13,
          lineHeight: 18,
        }}
      >
        Add To Cart
      </Text>
    </TouchableOpacity>
  );

  const QtyController = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: colors.primary,
        height: 40,
      }}
    >
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          if (qty <= 1) {
            setQty(0);
            setInputVal("1");
          } else {
            const next = qty - 1;
            setQty(next);
            setInputVal(String(next));
          }
        }}
        style={{
          width: 40,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: qty === 1 ? "rgba(255,255,255,0.18)" : "transparent",
        }}
      >
        {qty === 1 ? (
          <Trash2 size={15} color="#fff" strokeWidth={2.2} />
        ) : (
          <Minus size={15} color="#fff" strokeWidth={2.5} />
        )}
      </TouchableOpacity>

      <TextInput
        ref={inputRef}
        value={inputVal}
        onChangeText={handleQtyInput}
        onBlur={handleInputBlur}
        maxLength={3}
        keyboardType="number-pad"
        selectTextOnFocus
        style={{
          flex: 1,
          textAlign: "center",
          color: "#fff",
          fontFamily: "Poppins_600SemiBold",
          fontSize: 14,
          paddingVertical: 0,
          height: 40,
        }}
      />

      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          const next = qty + 1;
          setQty(next);
          setInputVal(String(next));
          onAddToCart?.(item);
        }}
        style={{
          width: 40,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Plus size={15} color="#fff" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPress?.(item)}
      style={{
        width: CARD_WIDTH,
        borderWidth: 1,
        borderColor: colors.border,
     
        padding: 10,
      }}
      className="rounded-2xl"
    >
      {/* ── Image + Discount Badge ── */}
      <View>
        <Image
          source={{ uri: item.s3_image_path }}
          style={{
            width: "100%",
            aspectRatio: 1,
            borderRadius: 12,
            backgroundColor: colors.surfaceElevated,
          }}
          contentFit="cover"
        />

        {discount && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
              backgroundColor: colors.error,
            }}
          >
            <Tag size={12} color={colors.textInverse} strokeWidth={2.5} />
            <Text
              style={{
                fontSize: OS ? 13 : 11,
                fontFamily: "Poppins_600SemiBold",
                color: colors.textInverse,
                includeFontPadding: false,
              }}
            >
              {discount}%
            </Text>
          </View>
        )}
      </View>

      {/* name and overview */}
      <View className="px-0.5 pt-2" style={{ gap: 3 }}>
        <Text
          numberOfLines={2}
          style={{
            fontSize: 14,
            lineHeight: 17,
            height: 36,

            fontFamily: "Poppins_600SemiBold",
            color: colors.text,
          }}
        >
          {item.product_name}
        </Text>

        <Text
          numberOfLines={2}
          style={{
            fontSize: 11,
            color: colors.textTertiary,
            lineHeight: 14,
            height: 28,
            textAlign: "left",
            fontFamily: "Poppins_400Regular",
          }}
        >
          {item.overview ?? ""}
        </Text>
      </View>

      {/* Price row */}
      <View className="flex-row items-center justify-between mt-1">
        <View className="flex-row items-baseline" style={{ gap: 4 }}>
          <Text
            style={{
              fontSize: OS ? 18 : 16,
              fontFamily: "Poppins_600SemiBold",
              color: colors.primary,
              lineHeight: 23,
            }}
          >
            ₹ {Number(item.selling_price).toLocaleString("en-IN")}
          </Text>

          <Text
            style={{
              fontSize: OS ? 12 : 10,
              fontFamily: "Poppins_500Medium",
              color: colors.textTertiary,
              textDecorationLine: "line-through",
              lineHeight: 20,
              marginBottom: 1,
            }}
          >
            ₹{parseInt(item.mrp)}
          </Text>
        </View>

        {rating > 1 && (
          <View className="flex-row items-center">
            <StarIcon
              size={13}
              color={colors.starColor}
              fill={colors.starColor}
            />
            <Text
              className=""
              style={{
                fontSize: 13,
                includeFontPadding: false,
                textAlignVertical: "center",
                fontFamily: "Poppins_600SemiBold",
              }}
            >
              {" "}
              {rating.toFixed(1)}
            </Text>
          </View>
        )}
      </View>

      {/* ── Cart Button ── */}
      <View style={{ marginTop: 8 }}>
        {qty === 0 ? AddButton : QtyController}
      </View>
    </TouchableOpacity>
  );
}
