import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "../../theme";
import { useCategory } from "../../hooks/homeHooks";

// ── Skeleton Item ──
const CategorySkeleton = ({ colors }: { colors: any }) => {
  return (
    <View style={{ alignItems: "center", marginRight: 16, }}>
      {/* Circle shimmer */}
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: colors.surfaceElevated ?? "#E0E0E0",
          opacity: 0.6,
        }}
      />
      {/* Label shimmer */}
      <View
        style={{
          width: 48,
          height: 10,
          borderRadius: 4,
          marginTop: 8,
          backgroundColor: colors.surfaceElevated ?? "#E0E0E0",
          opacity: 0.6,
        }}
      />
    </View>
  );
};

const CategoryList = () => {
  const { categories, loading, error, refetch } = useCategory();
  const { colors } = useTheme();
  

  const renderItem = ({ item }: any) => {
    return (
      <TouchableOpacity className="items-center mr-4 " >
        <Image
          source={{ uri: item.s3_image_path }}
          style={{
            width: 50,
            height: 40,
            borderRadius: 30,
            backgroundColor: colors.surfaceElevated,
          }}
          contentFit="cover"
        />
        <Text
          className="mt-2 text-xs text-center"
          style={{ color: colors.text }}
          numberOfLines={1}
        >
          {item.category_name}
        </Text>
      </TouchableOpacity>
    );
  };

  // ── Loading → show skeleton ──
  if (loading) {
    return (
      <View className="py-3">
        <FlatList
          data={[1, 2, 3, 4, 5, 6]}          
          keyExtractor={(item) => String(item)}
          renderItem={() => <CategorySkeleton colors={colors} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <View className="py-3 px-4">
        <Text style={{ color: colors.textTertiary, fontSize: 12 }}>
          Categories load nahi ho sakiin.{" "}
          <Text
            style={{ color: colors.primary, textDecorationLine: "underline" }}
          >
            Retry
          </Text>
        </Text>
      </View>
    );
  }

  // ── Actual list ──
  return (
    <View className="pt-1">
      <FlatList
        data={categories}
        keyExtractor={(item, index) => item.slug + index}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </View>
  );
};

export default CategoryList;