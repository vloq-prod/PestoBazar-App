import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "../../theme";
import { useCategory } from "../../hooks/homeHooks";
import { useResponsive } from "../../utils/useResponsive";

// ─── Skeleton ────────────────────────────────────────────────────────────────

const SkeletonItem = () => {
  const { colors } = useTheme();
  return (
    <View style={styles.itemWrapper}>
      <View
        style={[
          styles.imageCircle,
          { backgroundColor: colors.backgroundSkeleton },
        ]}
      />
      <View
        style={[
          styles.skeletonLabel,
          { backgroundColor: colors.backgroundSkeleton },
        ]}
      />
    </View>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const CategoryList = () => {
  const { categories, loading, error, refetch } = useCategory();
  const { colors } = useTheme();
  const { getResponsiveFontSize } = useResponsive();

  const renderItem = ({ item }: any) => (
    <TouchableOpacity activeOpacity={0.7} style={styles.itemWrapper}>
      {/* Circle container with border */}
      <View
        style={[
          styles.imageCircle,
          {
            borderColor: colors.border,
            backgroundColor: colors.surface,
            shadowColor: colors.primary,
          },
        ]}
      >
        <Image
          source={{ uri: item.s3_image_path }}
          style={styles.image}
          contentFit="cover"
        />
      </View>

      <Text
        numberOfLines={2}
        style={[
          styles.label,
          {
            color: colors.text,
            fontFamily: "Poppins_500Medium",
            fontSize: getResponsiveFontSize(10),
          },
        ]}
      >
        {item.category_name}
      </Text>
    </TouchableOpacity>
  );

  if (error) {
    return (
      <View style={styles.errorRow}>
        <Text
          style={{
            color: colors.textTertiary,
            fontSize: getResponsiveFontSize(12),
            fontFamily: "Poppins_400Regular",
          }}
        >
          Categories load nahi ho sakiin.{" "}
        </Text>
          <Text
            style={{
              color: colors.primary,
              fontSize: getResponsiveFontSize(12),
              fontFamily: "Poppins_600SemiBold",
              textDecorationLine: "underline",
            }}
          >
            Retry
          </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper} >
      {loading ? (
        <View style={styles.skeletonRow}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonItem key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item, index) => item.slug + index}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
        />
      )}
    </View>
  );
};

export default CategoryList;

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 6,
    paddingBottom: 4,
  },
  skeletonRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 16,
  },
  itemWrapper: {
    alignItems: "center",
    width: 64,
  },
  imageCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    overflow: "hidden",
    // shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  label: {
    marginTop: 6,
    textAlign: "center",
    lineHeight: 14,
  },
  skeletonLabel: {
    marginTop: 6,
    width: 44,
    height: 10,
    borderRadius: 5,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});