// src/components/home/HomeProduct.tsx

import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useHomeProduct } from "../../hooks/homeHooks";
import ItemCard from "../comman/ItemCard";
import { useTheme } from "../../theme";
import { ChevronRight } from "lucide-react-native";
import { ProductItem } from "../../types/home.types";
import { useRouter } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const H_PADDING = 16 * 2;
const GAP = 10;

const ITEM_WIDTH = (SCREEN_WIDTH - H_PADDING - GAP) / 2.7;

// ─────────────────────────────────────────────
// Skeleton Card (matches real UI)
// ─────────────────────────────────────────────
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

const sectionDescriptions: Record<string, string> = {
  "Best Selling": "Freshly added products curated just for you.",
  "New Arrivals": "Most popular picks customers are loving right now.",
  "Top Rated": "Highest rated products based on customer reviews.",
  Trending: "Best-selling products trusted by thousands.",
};
// ─────────────────────────────────────────────
// Section Header
// ─────────────────────────────────────────────
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
          marginHorizontal: 16,
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
          // onPress={refetch}
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
      {sections.map((section, index) => (
        <View key={index} style={{ gap: 12 }}>
          <SectionHeader
            title={section.title}
            description={sectionDescriptions[section.title]}
            onViewAll={() =>
              router.push({
                pathname: "(stack)/viewall/[all]",
                params: {
                  title: section.title,
                },
              })
            }
          />
          <FlatList
            horizontal
            data={section.products}
            keyExtractor={(item) => String(item.id)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
            renderItem={({ item }) => (
              <View style={{ width: ITEM_WIDTH }}>
                <ItemCard
                  item={item as any}
                  onPress={(p: any) => console.log("press", p.slug)}
                />
              </View>
            )}
            initialNumToRender={4}
            maxToRenderPerBatch={5}
            windowSize={5}
            removeClippedSubviews
          />
        </View>
      ))}
    </View>
  );
};

export default HomeProduct;
