import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React from "react";
import ReviewCard from "./ReviewCard";
import { useProductReviews } from "../../hooks/productDetailsHook";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";

type Props = {
  product_id: number;
};

const ReviewSection = ({ product_id }: Props) => {
  const { reviews, loading, fetchingMore, error, hasMore, loadMore } =
    useProductReviews({ product_id });

  const { colors } = useTheme();
  const { font } = useResponsive();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
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

  if (reviews.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No reviews available yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
       <View style={{  gap: 1 }}>
             <Text
               style={{
                 fontSize: font(18),
                 fontFamily: "Poppins_700Bold",
                 color: colors.text,
                 lineHeight: font(22),
               }}
             >
               Reviews
             </Text>
             {/* <Text
               style={{
                 fontSize: font(12),
                 fontFamily: "Poppins_400Regular",
                 color: colors.textSecondary,
                 lineHeight: font(18),
               }}
             >
               Frequently Bought Together by Other Customers
             </Text> */}
           </View>
      <FlatList
        data={reviews}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ReviewCard item={item} />}
        scrollEnabled={false}
        onEndReached={() => {
          if (hasMore && !fetchingMore) loadMore();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          fetchingMore ? (
            <ActivityIndicator
              size="small"
              color="#4F46E5"
              style={{ marginVertical: 12 }}
            />
          ) : null
        }
      />
    </View>
  );
};

export default ReviewSection;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12,
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
