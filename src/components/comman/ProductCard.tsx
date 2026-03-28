import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { LinearGradient } from "expo-linear-gradient";
import { Eye, Flame } from "lucide-react-native";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const formatPrice = (price: string): string =>
  `₹${parseFloat(price).toLocaleString("en-IN")}`;

export const getDiscountPercent = (mrp: string, selling: string): number => {
  const m = parseFloat(mrp);
  const s = parseFloat(selling);
  if (!m || !s || m <= s) return 0;
  return Math.round(((m - s) / m) * 100);
};

// ─── Countdown Hook ───────────────────────────────────────────────────────────

import { useEffect } from "react";

export const useCountdown = (expiryDate: string) => {
  const calc = () => {
    const diff = new Date(expiryDate).getTime() - Date.now();
    if (diff <= 0)
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    const totalSec = Math.floor(diff / 1000);
    return {
      days: Math.floor(totalSec / 86400),
      hours: Math.floor((totalSec % 86400) / 3600),
      minutes: Math.floor((totalSec % 3600) / 60),
      seconds: totalSec % 60,
      expired: false,
    };
  };
  const [time, setTime] = React.useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [expiryDate]);
  return time;
};

// ─── Timer Unit Box ───────────────────────────────────────────────────────────

const TimerUnit: React.FC<{
  value: string;
  label: string;
  colors: any;
  fs: (n: number) => number;
}> = ({ value, label, colors, fs }) => (
  <View
    style={[
      cardStyles.timerBox,
      {
        backgroundColor: colors.primary + "12",
        borderColor: colors.border,
      },
    ]}
  >
    <Text
      style={{
        fontFamily: "Poppins_700Bold",
        fontSize: fs(13),
        color: colors.primary,
        lineHeight: fs(17),
        includeFontPadding: false,
      }}
    >
      {value}
    </Text>
    <Text
      style={{
        fontFamily: "Poppins_500Medium",
        fontSize: fs(7),
        color: colors.textTertiary,
        letterSpacing: 0.3,
        lineHeight: fs(10),
        includeFontPadding: false,
        textTransform: "uppercase",
      }}
    >
      {label}
    </Text>
  </View>
);

// ─── Timer + CTA ─────────────────────────────────────────────────────────────

const TimerWithCTA: React.FC<{
  expiryDate: string;
  colors: any;
  fs: (n: number) => number;
  onPress?: () => void;
}> = ({ expiryDate, colors, fs, onPress }) => {
  const { days, hours, minutes, seconds, expired } = useCountdown(expiryDate);
  const pad = (n: number) => String(n).padStart(2, "0");

  if (expired) {
    return (
      <View className="flex-row items-center mt-3" style={{ gap: 8 }}>
        <View
          className="flex-row items-center flex-1 justify-center"
          style={{
            gap: 5,
            paddingVertical: 7,
            backgroundColor: colors.backgroundSkeleton,
            borderRadius: 10,
          }}
        >
          <Flame size={12} color={colors.textTertiary} strokeWidth={2} />
          <Text
            style={{
              fontFamily: "Poppins_500Medium",
              fontSize: fs(11),
              color: colors.textTertiary,
            }}
          >
            Offer Expired
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ marginTop: 3 }}>
      {/* Label row */}
      <View
        className="flex-row items-center"
        style={{ gap: 2, marginBottom: 2 }}
      >
        <Flame size={10} color={colors.primary} strokeWidth={2.5} />
        <Text
          style={{
            fontFamily: "Poppins_600SemiBold",
            fontSize: fs(9),
            letterSpacing: 0.8,
            lineHeight: 17,
            textTransform: "uppercase",
          }}
        >
          Hurry up! Ends in
        </Text>
      </View>

      {/* Timer + CTA row */}
      <View className="flex-row items-center" style={{ gap: 6 }}>
        {/* Timer boxes */}
        <View className="flex-row items-center" style={{ gap: 3 }}>
          {days > 0 && (
            <>
              <TimerUnit
                value={pad(days)}
                label="Days"
                colors={colors}
                fs={fs}
              />
              <Text style={[cardStyles.colon, { fontSize: fs(14) }]}>:</Text>
            </>
          )}
          <TimerUnit value={pad(hours)} label="Hrs" colors={colors} fs={fs} />
          <Text style={[cardStyles.colon, { fontSize: fs(14) }]}>:</Text>
          <TimerUnit value={pad(minutes)} label="Min" colors={colors} fs={fs} />
          <Text style={[cardStyles.colon, { fontSize: fs(14) }]}>:</Text>
          <TimerUnit value={pad(seconds)} label="Sec" colors={colors} fs={fs} />
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.82}
          style={{
            flex: 1,
            backgroundColor: colors.primary,

            paddingVertical: 9,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
          }}
          className="rounded-lg"
        >
          <Eye size={13} color="#fff" strokeWidth={2.5} />
          <Text
            style={{
              fontFamily: "Poppins_600SemiBold",
              fontSize: fs(11),
              color: "#fff",
              letterSpacing: 0.3,
              lineHeight: 18,
            }}
          >
            View Product
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── ProductCard Props ────────────────────────────────────────────────────────

export interface ProductCardItem {
  id: number;
  product_name: string;
  mrp: string;
  selling_price: string;
  overview?: string | null;
  expiry_date: string;
  s3_image_path?: string;
  images?: string[];
}

interface ProductCardProps {
  item: ProductCardItem;
  cardWidth: number;
  onPress?: () => void;
}

// ─── ProductCard ──────────────────────────────────────────────────────────────

const ProductCard: React.FC<ProductCardProps> = ({
  item,
  cardWidth,
  onPress,
}) => {
  const { colors } = useTheme();
  const { getResponsiveFontSize: fs } = useResponsive();
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<any>(null);

  const allImages = item.images?.filter(Boolean)?.length
    ? item.images.filter(Boolean)
    : item.s3_image_path
      ? [item.s3_image_path]
      : ["https://via.placeholder.com/300"];

  const discount = getDiscountPercent(item.mrp, item.selling_price);
  const hasMrp = parseFloat(item.mrp) > parseFloat(item.selling_price);

  // Fixed sizing — same layout regardless of image count
  const INNER = cardWidth - 24;
  const THUMB_W = 52;
  const GAP = 8;
  const IMG_SIZE = INNER - THUMB_W - GAP;

  return (
    <View
      className="rounded-lg border overflow-hidden"
      style={{
        width: cardWidth,
        backgroundColor: colors.cardBackground,
        borderColor: colors.border,
      }}
    >
      {/* ── Media row ── */}
      <View className="flex-row p-2" style={{ gap: GAP }}>
        {/* Main carousel */}
        <View
          className="rounded-lg overflow-hidden"
          style={{ width: IMG_SIZE, height: IMG_SIZE }}
        >
          <Carousel
            ref={carouselRef}
            width={IMG_SIZE}
            height={IMG_SIZE}
            data={allImages}
            loop={allImages.length > 1}
            autoPlay={allImages.length > 1}
            autoPlayInterval={3200}
            scrollAnimationDuration={500}
            onSnapToItem={setActiveIndex}
            renderItem={({ item: uri }: { item: string }) => (
              <Image
                source={{ uri }}
                style={{ width: IMG_SIZE, height: IMG_SIZE }}
                resizeMode="cover"
              />
            )}
          />

          <LinearGradient
            colors={["transparent", "rgba(8,6,32,0.35)"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0.55 }}
            end={{ x: 0, y: 1 }}
            pointerEvents="none"
          />

          {/* Dot indicators */}
          {allImages.length > 1 && (
            <View
              className="absolute bottom-1.5 left-0 right-0 flex-row justify-center items-center"
              style={{ gap: 3 }}
              pointerEvents="none"
            >
              {allImages.slice(0, 5).map((_, i) => (
                <View
                  key={i}
                  style={[
                    cardStyles.dot,
                    {
                      backgroundColor:
                        i === activeIndex ? "#fff" : "rgba(255,255,255,0.42)",
                      width: i === activeIndex ? 14 : 5,
                    },
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Thumbnail column — placeholder if single image */}
        <View style={{ width: THUMB_W, maxHeight: IMG_SIZE }}>
          {allImages.length > 1 ? (
            <ScrollView
              style={{ width: THUMB_W }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: 6 }}
              nestedScrollEnabled
            >
              {allImages.map((uri, i) => (
                <Pressable
                  key={i}
                  onPress={() => {
                    setActiveIndex(i);
                    carouselRef.current?.scrollTo({
                      index: i,
                      animated: true,
                    });
                  }}
                  style={{
                    width: THUMB_W,
                    height: THUMB_W,
                    borderRadius: 8,
                    overflow: "hidden",
                    borderColor:
                      i === activeIndex ? colors.primary : colors.border,
                    borderWidth: i === activeIndex ? 2 : 1,
                    opacity: i === activeIndex ? 1 : 0.7,
                  }}
                >
                  <Image
                    source={{ uri }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <View style={{ width: THUMB_W }} />
          )}
        </View>
      </View>

      {/* Divider */}
      <View
        style={{
          height: StyleSheet.hairlineWidth,
          backgroundColor: colors.border,
          marginHorizontal: 12,
        }}
      />

      {/* ── Info ── */}
      <View className="px-3 pt-2.5 pb-3">
        {/* Product name */}
        <Text
          numberOfLines={2}
          style={{
            fontFamily: "Poppins_500Medium",
            fontSize: fs(15),
            color: colors.text,
            lineHeight: 18,
            height: 36,
            marginBottom: 3,
          }}
        >
          {item.product_name}
        </Text>

        {/* Overview */}
        <Text
          numberOfLines={2}
          style={{
            fontFamily: "Poppins_400Regular",
            fontSize: fs(14),
            color: colors.textTertiary,

            marginBottom: 8,
          }}
        >
          {item.overview ?? ""}
        </Text>

        {/* Price row */}
        <View
          className="flex-row items-end"
          style={{ gap: 5, marginBottom: 2 }}
        >
          <Text
            style={{
              fontFamily: "Poppins_700Bold",
              fontSize: fs(22),
              color: colors.text,
              lineHeight: 28,
              letterSpacing: -0.5,
            }}
          >
            {formatPrice(item.selling_price)}
          </Text>

          {hasMrp && (
            <>
              <Text
                style={{
                  fontFamily: "Poppins_400Regular",
                  fontSize: fs(13),
                  color: colors.textTertiary,
                  textDecorationLine: "line-through",
                  lineHeight: 22,
                }}
              >
                {formatPrice(item.mrp)}
              </Text>

              {discount > 0 && (
                <Text
                  style={{
                    fontFamily: "Poppins_700Bold",
                    fontSize: fs(13),
                    color: colors.error,
                    lineHeight: 22,
                    letterSpacing: 0.2,
                  }}
                >
                  {discount}% off
                </Text>
              )}
            </>
          )}
        </View>

        {/* Timer + CTA */}
        <TimerWithCTA
          expiryDate={item.expiry_date}
          colors={colors}
          fs={fs}
          onPress={onPress}
        />
      </View>
    </View>
  );
};

export default ProductCard;

// ─── Skeleton Card (shared) ───────────────────────────────────────────────────

export const SkeletonCard: React.FC<{ cardWidth: number }> = ({
  cardWidth,
}) => {
  const { colors } = useTheme();
  const INNER = cardWidth - 24;
  const IMG_SIZE = INNER - 52 - 8;

  return (
    <View
      className="rounded-2xl border overflow-hidden"
      style={{
        width: cardWidth,
        backgroundColor: colors.cardBackground,
        borderColor: colors.border,
      }}
    >
      <View className="flex-row p-3" style={{ gap: 8 }}>
        <View
          className="rounded-xl"
          style={{
            width: IMG_SIZE,
            height: IMG_SIZE,
            backgroundColor: colors.backgroundSkeleton,
          }}
        />
        <View style={{ width: 52, gap: 6 }}>
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              className="rounded-lg"
              style={{
                width: 52,
                height: 52,
                backgroundColor: colors.backgroundSkeleton,
              }}
            />
          ))}
        </View>
      </View>

      <View
        style={{
          height: StyleSheet.hairlineWidth,
          backgroundColor: colors.border,
          marginHorizontal: 12,
        }}
      />

      <View className="px-3 pt-3 pb-3" style={{ gap: 10 }}>
        {[75, 55, 45, 100].map((w, i) => (
          <View
            key={i}
            className="rounded"
            style={{
              height: i === 2 ? 28 : 10,
              width: `${w}%`,
              backgroundColor: colors.backgroundSkeleton,
            }}
          />
        ))}
        <View style={{ gap: 6 }}>
          <View
            style={{
              height: 8,
              width: "40%",
              borderRadius: 4,
              backgroundColor: colors.backgroundSkeleton,
            }}
          />
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center" style={{ gap: 3 }}>
              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  className="rounded-lg"
                  style={{
                    width: 38,
                    height: 40,
                    backgroundColor: colors.backgroundSkeleton,
                  }}
                />
              ))}
            </View>
            <View
              className="rounded-xl"
              style={{
                width: 90,
                height: 36,
                backgroundColor: colors.backgroundSkeleton,
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const cardStyles = StyleSheet.create({
  dot: {
    height: 5,
    borderRadius: 3,
  },
  timerBox: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 4,
    minWidth: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  colon: {
    fontFamily: "Poppins_700Bold",
  },
});
