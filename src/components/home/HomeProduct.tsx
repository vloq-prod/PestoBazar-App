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
  import { useAddToCart } from "../../hooks/cartHooks";
  import { useAppVisitorStore } from "../../store/auth";
  import { ProductItem } from "../../types/home.types";
  import { useRouter } from "expo-router";

  const { width: SCREEN_WIDTH } = Dimensions.get("window");

  const H_PADDING = 16 * 2;
  const GAP = 10;

  const ITEM_WIDTH = (SCREEN_WIDTH - H_PADDING - GAP) / 2.2;

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

  // ─────────────────────────────────────────────
  // Section Header
  // ─────────────────────────────────────────────
  const SectionHeader = ({ title, onViewAll }: any) => {
    const { colors } = useTheme();

    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 18,
            color: colors.text,
            fontFamily: "Poppins_600SemiBold",
          }}
        >
          {title}
        </Text>

        <TouchableOpacity
          onPress={onViewAll}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Text
            style={{
              fontSize: 13,
              color: colors.primary,
              fontFamily: "Poppins_500Medium",
            }}
          >
            View All
          </Text>
          <ChevronRight size={14} color={colors.primary} />
        </TouchableOpacity>
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
    const { addToCart } = useAddToCart();
    const visitorId = useAppVisitorStore((state) => state.visitorId);

    const handleAddToCart = (product: ProductItem, qty: number) => {
      addToCart({
        visitor_id: visitorId,
        product_id: product.id,
        qty: qty,
      });
    };

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
              onViewAll={() => router.push({
                pathname: "(stack)/viewall/[all]",
                params: {
                  title: section.title,
                }
              })}
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
                    onAddToCart={(item: ProductItem, qty: number) =>
                      handleAddToCart(item, qty)
                    }
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
