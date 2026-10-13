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

import SeeAllProductsButton from "../comman/SeeAllProductsButton";
import { CategorySectionBlock } from "./CategoryCardSection";
import { CustomSection } from "../../types/customSection.types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const PADDING = 16;
const GAP = 8;
const ITEM_WIDTH = (SCREEN_WIDTH - PADDING * 2 - GAP * 2) / 3;

// Skeleton Card (matches real UI)
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

// Skeleton Section
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

// Section Header
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
    return null;
  }

  const sections = customSectionsRes?.data || [];

  if (sections.length === 0) {
    return null;
  }

  return (
    <View style={{ gap: 24, marginVertical: 10 }}>
      {sections.map((section: CustomSection) => {
        const isCategory =
          section.type === "category" ||
          (Array.isArray(section.categories) && section.categories.length > 0);

        if (isCategory && section.categories && section.categories.length > 0) {
          return (
            <CategorySectionBlock
              key={`cat-sec-${section.section_id}`}
              section={section}
            />
          );
        }

        if (section.products && section.products.length > 0) {
          // Map section products to ProductItem format expected by ItemCard
          const mappedProducts = section.products.map((p) => {
            const productId = Number(p.product_variation_id || p.id || p.product_id);
            const slug = (p.url ? p.url.split("/").pop() : "") || "";
            return {
              id: productId,
              product_id: productId,
              product_variation_id: Number(p.product_variation_id || p.id),
              product_name: p.product_name,
              mrp: String(p.mrp),
              selling_price: String(p.selling_price),
              s3_image_path: p.s3_image_path || p.image_path,
              avg_rating: String(p.avg_rating || 0),
              slug: slug,
              product_slug: slug || p.url,
              overview: p.overview || "",
              url: p.url,
              total_reviews: 0,
            };
          });

          // Slice maximum 6 products per section (3 columns x 2 rows)
          const displayProducts = mappedProducts.slice(0, 6);

          const handleViewAll = () => {
            router.push({
              pathname: "/(stack)/viewall/custom/[id]",
              params: {
                id: section.section_id,
                title: section.section_title,
              },
            });
          };

          return (
            <View key={`prod-sec-${section.section_id}`} style={{ gap: 12 }}>
              <SectionHeader
                title={section.section_title}
                description={section.section_description}
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

              {/* Zepto style "See all products ▶" button with 3 product avatars */}
              <SeeAllProductsButton
                products={section.products}
                onPress={handleViewAll}
                style={{ marginTop: 4 }}
              />
            </View>
          );
        }

        return null;
      })}
    </View>
  );
};

export default CustomSections;
