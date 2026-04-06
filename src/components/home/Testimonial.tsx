import React from "react";
import { Text, View, Dimensions, ActivityIndicator } from "react-native";
import { useTheme } from "../../theme";
import { TestimonialItem } from "../../types/home.types";
import { useTestimonial } from "../../hooks/homeHooks";
import Entypo from "@expo/vector-icons/Entypo";
import { MapPinIcon, Star } from "lucide-react-native";
import Carousel from "react-native-reanimated-carousel";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.75;
const CARD_MARGIN = 5;
const CARD_HEIGHT = 230;

// ─── Star Rating ─────────────────────────────────────────
const StarRating = ({
  rating,
  starColor,
}: {
  rating: number;
  starColor: string;
}) => (
  <View className="flex-row">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={12}
        strokeWidth={1.5}
        color={i < rating ? starColor : "#D1D5DB"}
        fill={i < rating ? starColor : "transparent"}
        style={{ marginRight: 2 }}
      />
    ))}
  </View>
);

// ─── Initials ─────────────────────────────────────────────
const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

// ─── Card ────────────────────────────────────────────────
const TestimonialCard = ({
  item,
  colors,
}: {
  item: TestimonialItem;
  colors: any;
}) => {
  const rating = parseInt(item.ratings, 10) || 5;

  const parseName = (full: string) => {
    const [name, city] = full.split(",");
    return { name: name?.trim(), city: city?.trim() };
  };

  const { name, city } = parseName(item.name);
  const initials = getInitials(name);

  return (
    <View
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: colors.cardBackground,
        borderColor: colors.border,
      }}
      className="rounded-3xl border p-4 gap-2" 
    >
      {/* Stars + Quote */}
      <View className="flex-row items-center justify-between">
        <StarRating rating={rating} starColor={colors.starColor} />
        <Entypo name="quote" size={30} color={colors.primary + "20"} />
      </View>

      {/* Comment */}
      <View style={{ flex: 1 }}>
        <Text
          style={{ color: colors.textSecondary }}
          className="text-sm leading-5"
        >
          {item.comment}
        </Text>
      </View>

      {/* Divider */}
      <View className="border-b-[1px]" style={{ borderColor: colors.border }} />

      {/* Author */}
      <View className="flex-row items-center gap-2">
        <View
          style={{ backgroundColor: colors.primary + "20" }}
          className="w-11 h-11 rounded-full items-center justify-center"
        >
          <Text style={{ color: colors.primary }} className="text-lg font-bold">
            {initials}
          </Text>
        </View>

        <View className="flex-1 gap-0.5">
          <Text
            style={{
              color: colors.text,
              includeFontPadding: false,
              fontFamily: "Poppins_500Medium",
            }}
            className="text-[13px]"
            numberOfLines={1}
          >
            {name}
          </Text>
          {city ? (
            <View className="flex-row items-center gap-1">
              <MapPinIcon size={12} color={colors.textSecondary} />
              <Text
                className="text-[11px]"
                style={{ color: colors.textSecondary }}
                numberOfLines={1}
              >
                {city}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
};

// ─── Main ────────────────────────────────────────────────
const Testimonial = () => {
  const { colors } = useTheme();
  const { testimonials, loading, error } = useTestimonial();

  if (loading) {
    return (
      <View className="h-[160px] justify-center items-center px-6">
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="h-[160px] justify-center items-center px-6">
        <Text
          style={{ color: colors.error }}
          className="text-[13px] text-center"
        >
          Something went wrong. Please try again.
        </Text>
      </View>
    );
  }

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <View className="px-2">
      <Carousel
        width={CARD_WIDTH + CARD_MARGIN * 2}
        height={CARD_HEIGHT}
        data={testimonials}
        autoPlay
        autoPlayInterval={3000}
        scrollAnimationDuration={700}
        style={{ width }}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: CARD_MARGIN }}>
            <TestimonialCard item={item} colors={colors} />
          </View>
        )}
      />
    </View>
  );
};

export default Testimonial;
