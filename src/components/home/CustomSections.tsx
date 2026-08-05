// src/components/home/CustomSections.tsx

import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useCustomSections } from "../../hooks/customSection.hooks";
import ItemCard from "../comman/ItemCard";
import { useTheme } from "../../theme";
import { ChevronRight } from "lucide-react-native";
import { useResponsive } from "../../utils/useResponsive";
import { useRouter } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const H_PADDING = 16 * 2;
const GAP = 10;
const ITEM_WIDTH = (SCREEN_WIDTH - H_PADDING - GAP) / 2.7;

// Skeleton Card (matches real UI)
const SkeletonCard = () => {
  const { colors } = useTheme();

  return (
    <View style={{ width: ITEM_WIDTH, gap: 8 }}>
      <View
        style={{
          width: "100%",
          aspectRatio: 1,
          borderRadius: 14,
          backgroundColor: colors.backgroundSkeleton,
        }}
      />
      <View
        style={{
          height: 12,
          width: "80%",
          backgroundColor: colors.backgroundSkeleton,
          borderRadius: 6,
        }}
      />
      <View
        style={{
          height: 10,
          width: "55%",
          backgroundColor: colors.backgroundSkeleton,
          borderRadius: 6,
        }}
      />
      <View
        style={{
          height: 36,
          backgroundColor: colors.backgroundSkeleton,
          borderRadius: 8,
        }}
      />
    </View>
  );
};

// Skeleton Section
const SkeletonSection = () => {
  return (
    <View style={{ gap: 14 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 16,
        }}
      >
        <View
          style={{
            height: 16,
            width: 130,
            backgroundColor: "#e8e8e8",
            borderRadius: 8,
          }}
        />
        <View
          style={{
            height: 13,
            width: 60,
            backgroundColor: "#e8e8e8",
            borderRadius: 8,
          }}
        />
      </View>

      <FlatList
        horizontal
        data={[1, 2, 3]}
        keyExtractor={(i) => String(i)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        renderItem={() => <SkeletonCard />}
      />
    </View>
  );
};

// Section Header
const SectionHeader = ({ title, onViewAll, description }: any) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        paddingHorizontal: 16,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Poppins_600SemiBold",
            lineHeight: 26,
            color: colors.text,
            includeFontPadding: false,
          }}
        >
          {title}
        </Text>

        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={onViewAll}
        >
          <Text
            style={{
              fontSize: 12,
              color: colors.primary,
              fontFamily: "Poppins_600SemiBold",
              includeFontPadding: false,
            }}
          >
            View All
          </Text>

          <ChevronRight size={14} color={colors.primary} strokeWidth={2.4} />
        </TouchableOpacity>
      </View>
      {/* Description */}
      {!!description && (
        <Text
          style={{
            fontSize: 11,
            lineHeight: 18,
            color: colors.textSecondary,
            fontFamily: "Poppins_400Regular",
          }}
        >
          {description}
        </Text>
      )}
    </View>
  );
};

const CustomSections = () => {
  const { data: customSectionsRes, isLoading, error } = useCustomSections();
  const { colors } = useTheme();
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={{ gap: 24, marginVertical: 10 }}>
        <SkeletonSection />
      </View>
    );
  }

  if (error) {
    console.error("Error loading custom sections:", error);
    return null;
  }

  const sections = customSectionsRes?.data || [];

  if (sections.length === 0) {
    return null;
  }

  return (
    <View style={{ gap: 24, marginVertical: 10 }}>
      {sections.map((section) => {
        if (!section.products || section.products.length === 0) return null;

        // Map section products to ProductItem format expected by ItemCard
        const mappedProducts = section.products.map((p) => ({
          id: p.product_id || p.id,
          product_name: p.product_name,
          mrp: String(p.mrp),
          selling_price: String(p.selling_price),
          s3_image_path: p.s3_image_path,
          avg_rating: String(p.avg_rating || 0),
          slug: p.url ? p.url.split("/").pop() || "" : "",
          overview: p.overview || "",
          total_reviews: 0,
        }));

        return (
          <View key={section.section_id} style={{ gap: 12 }}>
            <SectionHeader
              title={section.section_title}
              description={section.section_description}
              onViewAll={() =>
                router.push({
                  pathname: "(stack)/viewall/custom/[id]",
                  params: {
                    id: section.section_id,
                    title: section.section_title,
                  },
                })
              }
            />
            <FlatList
              horizontal
              data={mappedProducts}
              keyExtractor={(item) => String(item.id)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
              renderItem={({ item }) => (
                <View style={{ width: ITEM_WIDTH }}>
                  <ItemCard item={item as any} />
                </View>
              )}
              initialNumToRender={4}
              maxToRenderPerBatch={5}
              windowSize={5}
              removeClippedSubviews
            />
          </View>
        );
      })}
    </View>
  );
};

export default CustomSections;
