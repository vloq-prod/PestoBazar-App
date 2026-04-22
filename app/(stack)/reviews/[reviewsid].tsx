import { StyleSheet, Text, View, FlatList, ActivityIndicator, StatusBar } from "react-native";
import React from "react";
import { useTheme } from "../../../src/theme";
import { useResponsive } from "../../../src/utils/useResponsive";
import { useLocalSearchParams } from "expo-router";
import { useProductReviews } from "../../../src/hooks/productDetailsHook";
import AppNavbar from "../../../src/components/comman/AppNavbar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StarIcon } from "lucide-react-native";
import ReviewCard from "../../../src/components/productDetails/ReviewCard";

const ReviewDetails = () => {
  const { reviewsid } = useLocalSearchParams();
  const product_id = Number(reviewsid);

  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const insets = useSafeAreaInsets();

  const { reviews, loading, error, fetchingMore, hasMore, loadMore } =
    useProductReviews({ product_id });

  const handleEndReached = () => {
    if (hasMore && !fetchingMore) loadMore();
  };

  const EmptyState = () => (
    <View style={{ alignItems: "center", paddingTop: spacing(60), gap: spacing(8) }}>
      <StarIcon size={spacing(40)} color={colors.border} fill={colors.border} />
      <Text style={{ fontSize: font(15), fontFamily: "Poppins_600SemiBold", color: colors.text }}>
        No Reviews Yet
      </Text>
      <Text style={{ fontSize: font(12), fontFamily: "Poppins_400Regular", color: colors.textTertiary, textAlign: "center" }}>
        Be the first to review this product
      </Text>
    </View>
  );

  const Footer = () => {
    if (!fetchingMore) return null;
    return (
      <View style={{ paddingVertical: spacing(16), alignItems: "center" }}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <AppNavbar showBack={true} title="Reviews" />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(13), color: colors.textSecondary }}>
            Failed to load reviews
          </Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item, index) => `review-${item?.id ?? index}`}
          renderItem={({ item }) => <ReviewCard item={item} />}
          ListEmptyComponent={<EmptyState />}
          ListFooterComponent={<Footer />}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: spacing(14),
            paddingTop: spacing(14),
            paddingBottom: insets.bottom + spacing(16),
            flexGrow: 1,
          }}
        />
      )}
    </View>
  );
};

export default ReviewDetails;

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});