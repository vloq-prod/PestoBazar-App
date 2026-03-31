import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { useTheme } from "../../theme";
import { useCategory } from "../../hooks/homeHooks";
import { useResponsive } from "../../utils/useResponsive";

// ─── Skeleton ────────────────────────────────────────────────────────────────

const SkeletonItem: React.FC<{ size: number }> = ({ size }) => {
  const { colors } = useTheme();
  return (
    <View>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.backgroundSkeleton,
        }}
      />
      <View
        style={{
          width: size - 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.backgroundSkeleton,
          marginTop: 7,
        }}
      />
      <View
        style={{
          width: (size - 8) * 0.6,
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.backgroundSkeleton,
          marginTop: 3,
        }}
      />
    </View>
  );
};

const formatCategoryName = (name: string) => {
  if (!name) return "";

  return name
    .replace(/control/gi, "") // remove "control"
    .replace(/controll/gi, "") // remove wrong spelling
    .trim();
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const CategoryList: React.FC = () => {
  const { categories, loading, error, refetch } = useCategory();
  const { colors } = useTheme();
  const { getResponsiveFontSize: fs, wp } = useResponsive();

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      activeOpacity={0.7}
      style={{ alignItems: "center", gap: 5 }}
    >
      {/* Image Circle */}
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 40,
          overflow: "hidden",
          borderWidth: 1.2,
          borderColor: colors.borderblack,
          backgroundColor: colors.surfaceElevated,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={{ uri: item.s3_image_path }}
          style={{
            width: "100%",
            height: "100%",
          }}
          contentFit="cover"
        />
      </View>

      {/* Category Name */}
      <Text
        numberOfLines={2}
        style={{
          fontFamily: "Poppins_500Medium",
          fontSize: fs(12),
          color: colors.textInverse,
          textAlign: "center",
          width: 70, // keeps text aligned nicely under circle
        }}
      >
        {formatCategoryName(item.category_name)}
      </Text>
    </TouchableOpacity>
  );

  if (error) {
    return (
      <View style={styles.errorRow}>
        <Text
          style={{
            color: colors.textTertiary,
            fontSize: fs(12),
            fontFamily: "Poppins_400Regular",
          }}
        >
          Unable to load categories.{" "}
        </Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text
            style={{
              color: colors.primary,
              fontSize: fs(12),
              fontFamily: "Poppins_600SemiBold",
              textDecorationLine: "underline",
            }}
          >
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View >
      {loading ? (
        <View style={styles.skeletonRow}></View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item, index) => item.slug + index}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 14, gap: 20 }}
        />
      )}
    </View>
  );
};

export default CategoryList;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  skeletonRow: {
    flexDirection: "row",
    paddingHorizontal: 14,
    gap: 6,
  },

  image: {
    width: "100%",
    height: "100%",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
