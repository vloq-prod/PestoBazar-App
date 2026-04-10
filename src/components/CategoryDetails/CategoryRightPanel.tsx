import React, { useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LayoutGrid, List, PackageSearch } from "lucide-react-native";
import { withTiming, type SharedValue } from "react-native-reanimated";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import ProductCard from "../ProductCard";
import { useListing } from "../../hooks/shopHooks";
import { CategoryItem } from "../../types/home.types";
import { ListingItem } from "../../types/shop.types";

export type ViewMode = "grid" | "list";

export type CategoryRightPanelProps = {
  selectedCategory: CategoryItem | null;
  categoryId: string;
  viewMode: ViewMode;
  onToggleView: () => void;
  hasSidebar: boolean;
  hasSubcategories?: boolean;
  mainCategoryId?: number;
  cartPreviewVisible?: SharedValue<number>;
};

const TIMING_CONFIG = { duration: 280 };

function ProductSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={styles.skeletonGrid}>
      {Array.from({ length: 6 }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.skeletonCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.skeletonMedia,
              { backgroundColor: colors.backgroundSkeleton },
            ]}
          />
          <View style={styles.skeletonBody}>
            <View
              style={[
                styles.skeletonLineLarge,
                { backgroundColor: colors.backgroundSkeleton },
              ]}
            />
            <View
              style={[
                styles.skeletonLineSmall,
                { backgroundColor: colors.backgroundSkeleton },
              ]}
            />
            <View
              style={[
                styles.skeletonPrice,
                { backgroundColor: colors.backgroundSkeleton },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

function EmptyState({ categoryName }: { categoryName: string }) {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();

  return (
    <View style={[styles.emptyWrap, { gap: spacing(10) }]}>
      <PackageSearch size={50} color={colors.textTertiary} strokeWidth={1.2} />
      <Text
        style={{
          fontSize: font(16),
          color: colors.text,
          fontFamily: "Poppins_600SemiBold",
          textAlign: "center",
        }}
      >
        No products found
      </Text>
      <Text
        style={{
          fontSize: font(13),
          lineHeight: font(20),
          color: colors.textSecondary,
          fontFamily: "Poppins_400Regular",
          textAlign: "center",
        }}
      >
        {categoryName
          ? `Nothing listed under "${categoryName}" yet.`
          : "No products available right now."}
      </Text>
    </View>
  );
}

export default function CategoryRightPanel({
  selectedCategory,
  categoryId,
  viewMode,
  onToggleView,
  hasSidebar,
  hasSubcategories = false,
  mainCategoryId,
  cartPreviewVisible,
}: CategoryRightPanelProps) {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const momentumRef = useRef(false);

  const resolvedCategoryId = categoryId === "0" ? mainCategoryId : categoryId;

  const { products, loading, loadingMore, hasMore, allLoaded, loadMore } =
    useListing({
      category_id: String(resolvedCategoryId),
    });

  const headerTitle = hasSidebar
    ? (selectedCategory?.category_name ?? "")
    : "All Products";

  const showHeader = hasSidebar ? !!selectedCategory : true;
  const isGrid = viewMode === "grid";

  const handleScrollBegin = () => {
    if (!cartPreviewVisible) return;
    cartPreviewVisible.value = withTiming(0, TIMING_CONFIG);
  };

  const handleScrollEnd = () => {
    if (!cartPreviewVisible) return;
    cartPreviewVisible.value = withTiming(1, TIMING_CONFIG);
  };

  if (loading) {
    return <ProductSkeleton />;
  }

  return (
    <View style={styles.root}>
      {showHeader && (
        <View
          style={[
            styles.panelHeader,
            {
              borderBottomColor: colors.border,
              backgroundColor: colors.surface,
              paddingHorizontal: spacing(12),
              paddingVertical: spacing(10),
            },
          ]}
        >
          <View style={styles.panelHeaderLeft}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: font(13.5),
                lineHeight: font(18),
                color: colors.text,
                fontFamily: "Poppins_600SemiBold",
              }}
            >
              {headerTitle}
            </Text>
            {products.length > 0 && (
              <Text
                style={{
                  marginTop: spacing(1),
                  fontSize: font(11),
                  color: colors.textSecondary,
                  fontFamily: "Poppins_400Regular",
                }}
              >
                {products.length} items
              </Text>
            )}
          </View>

          {!hasSubcategories && (
            <TouchableOpacity
              onPress={onToggleView}
              activeOpacity={0.8}
              style={[
                styles.toggleBtn,
                {
                  width: spacing(36),
                  height: spacing(36),
                  borderRadius: spacing(10),
                  borderColor: colors.primary,
                  backgroundColor: colors.primary + "15",
                },
              ]}
            >
              {isGrid ? (
                <LayoutGrid size={spacing(17)} color={colors.primary} />
              ) : (
                <List size={spacing(17)} color={colors.primary} />
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {products.length === 0 ? (
        <EmptyState categoryName={headerTitle} />
      ) : (
        <FlatList
          key={viewMode}
          data={products}
          keyExtractor={(item: ListingItem, index: number) =>
            `${item.id}_${index}`
          }
          renderItem={({ item }: { item: ListingItem }) =>
            isGrid ? (
              <View style={styles.gridCell}>
                <ProductCard item={item} mode="grid" />
              </View>
            ) : (
              <ProductCard item={item} mode="list" />
            )
          }
          numColumns={isGrid ? 2 : 1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: spacing(10),
            paddingBottom: spacing(40),
            flexGrow: 1,
          }}
          columnWrapperStyle={
            isGrid
              ? {
                  justifyContent: "space-between",
                  marginBottom: spacing(10),
                }
              : undefined
          }
          onMomentumScrollBegin={() => {
            momentumRef.current = false;
          }}
          onScrollBeginDrag={handleScrollBegin}
          onScrollEndDrag={handleScrollEnd}
          onMomentumScrollEnd={handleScrollEnd}
          onEndReached={() => {
            if (!momentumRef.current && hasMore && !loadingMore) {
              loadMore();
              momentumRef.current = true;
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerWrap}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : allLoaded ? (
              <View style={styles.footerWrap}>
                <Text
                  style={{
                    fontSize: font(12),
                    color: colors.textTertiary,
                    fontFamily: "Poppins_500Medium",
                  }}
                >
                  All items loaded
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  panelHeaderLeft: {
    flex: 1,
    marginRight: 10,
  },
  toggleBtn: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  gridCell: {
    width: "48.5%",
  },
  footerWrap: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 10,
  },
  skeletonCard: {
    width: "48.5%",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    marginBottom: 10,
  },
  skeletonMedia: {
    width: "100%",
    height: 110,
  },
  skeletonBody: {
    padding: 8,
  },
  skeletonLineLarge: {
    width: "80%",
    height: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  skeletonLineSmall: {
    width: "55%",
    height: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  skeletonPrice: {
    width: "40%",
    height: 12,
    borderRadius: 8,
  },
});
