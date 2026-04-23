import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React from "react";
import ReviewCard from "./ReviewCard";
import { useProductReviews } from "../../hooks/productDetailsHook";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { useRouter } from "expo-router";

type Props = {
  product_id: number;
};

const ReviewSection = ({ product_id }: Props) => {
  const { reviews, loading, error } = useProductReviews({ product_id });

  const router = useRouter();
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();

  const limitedReviews = reviews?.slice(0, 6) || [];

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text>Reviews Loading</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Failed to load reviews. Please try again.
        </Text>
      </View>
    );
  }
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { gap: spacing(25) }]}>
      <View className="flex-row items-center gap-3 ">
        <View
          style={{
            flex: 1,
            height: 1,
            backgroundColor: colors.border,
          }}
        />

        <Text
          numberOfLines={1}
          style={{
            fontFamily: "Poppins_700Bold",
            fontSize: font(18),
            includeFontPadding: false,
            textAlignVertical: "center",
          }}
        >
          Reviews
        </Text>

        <View
          style={{
            flex: 1,
            height: 1,
            backgroundColor: colors.border,
          }}
        />
      </View>
      {/* 🔥 HORIZONTAL SCROLL */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 12,
        }}
      >
        {limitedReviews.map((item) => (
          <View key={item.id}>
            <ReviewCard item={item} />
          </View>
        ))}
      </ScrollView>

      {reviews.length > 6 && (
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "(stack)/reviews/[reviewsid]",
              params: {
                reviewsid: product_id,
              },
            })
          }
          style={{
            height: 44,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
            marginHorizontal: 16,
          }}
        >
          <Text
            style={{
              color: colors.primary,
              fontFamily: "Poppins_600SemiBold",
              fontSize: font(13),
            }}
          >
            View more
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ReviewSection;

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
  },
  centered: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
  },
  emptyText: {
    color: "#888",
    fontSize: 14,
  },
});
