// src/components/home/HomeProduct.tsx

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useHomeProduct } from "../../hooks/homeHooks";
import ItemCard from "../comman/ItemCard";
import { useTheme } from "../../theme";
import { ChevronRight } from "lucide-react-native";
import { ProductItem } from "../../types/home.types";
import { useRouter } from "expo-router";

import SeeAllProductsButton from "../comman/SeeAllProductsButton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const PADDING = 16;
const GAP = 8;
const ITEM_WIDTH = (SCREEN_WIDTH - PADDING * 2 - GAP * 2) / 3;

// ─────────────────────────────────────────────
// Skeleton Card (matches real UI)
// ─────────────────────────────────────────────
const SkeletonCard = () => {
  const { colors } = useTheme();

  return (
    <View style={{ width: ITEM_WIDTH, gap: 6 }}>
      <View
        style={{
          width: "100%",
          aspectRatio: 1,
          borderRadius: 12,
          backgroundColor: colors.backgroundSkeleton,
        }}
      />
      <View
        style={{
          height: 10,
          width: "80%",
          backgroundColor: colors.backgroundSkeleton,
          borderRadius: 4,
        }}
      />
      <View
        style={{
          height: 8,
          width: "55%",
          backgroundColor: colors.backgroundSkeleton,
          borderRadius: 4,
        }}
      />
      <View
        style={{
          height: 32,
          backgroundColor: colors.backgroundSkeleton,
          borderRadius: 6,
        }}
      />
    </View>
  );
};

// ─────────────────────────────────────────────
// Skeleton Section
// ─────────────────────────────────────────────
const SkeletonSection = () => {
  return (
    <View style={{ gap: 14 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: PADDING,
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

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          paddingHorizontal: PADDING,
          columnGap: GAP,
          rowGap: 12,
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </View>
    </View>
  );
};

const sectionDescriptions: Record<string, string> = {
  "Best Selling": "Freshly added products curated just for you.",
  "New Arrivals": "Most popular picks customers are loving right now.",
  "Top Rated": "Highest rated products based on customer reviews.",
  Trending: "Best-selling products trusted by thousands.",
};

// ─────────────────────────────────────────────
// Section Header
// ─────────────────────────────────────────────
const SectionHeader = ({ title, description }: any) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        paddingHorizontal: PADDING,
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

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const HomeProduct = () => {
  const { sections, loading, error } = useHomeProduct();
  const { colors } = useTheme();

  const router = useRouter();

  // ── Loading
  if (loading) {
    return (
      <View style={{ gap: 24 }}>
        <SkeletonSection />
        <SkeletonSection />
      </View>
    );
  }

  // ── Error
  if (error) {
    return (
      <View
        style={{
          marginHorizontal: PADDING,
          padding: 20,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: "center",
          gap: 10,
        }}
      >
        <Text style={{ color: colors.textSecondary }}>
          Failed to load products
        </Text>

        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: "#fff" }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Main UI
  return (
    <View style={{ gap: 20 }}>
      {sections.map((section, index) => {
        if (!section.products || section.products.length === 0) return null;
        const displayProducts = section.products.slice(0, 6);

        return (
          <View key={index} style={{ gap: 12 }}>
            <SectionHeader
              title={section.title}
              description={sectionDescriptions[section.title]}
            />
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                paddingHorizontal: PADDING,
                columnGap: GAP,
                rowGap: 12,
              }}
            >
              {displayProducts.map((product) => (
                <View key={product.id} style={{ width: ITEM_WIDTH }}>
                  <ItemCard item={product as any} />
                </View>
              ))}
            </View>
            <SeeAllProductsButton
              products={section.products}
              onPress={() =>
                router.push({
                  pathname: "(stack)/viewall/[all]",
                  params: {
                    title: section.title,
                  },
                })
              }
              style={{ marginTop: 4 }}
            />
          </View>
        );
      })}
    </View>
  );
};

export default HomeProduct;
