import { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ListRenderItem,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";
import AppNavbar from "../../src/components/comman/AppNavbar";
import {
  ArrowDownUp,
  SlidersHorizontal,
  LayoutGrid,
  List,
} from "lucide-react-native";
import { useListing } from "../../src/hooks/shopHooks";
import FilterBottomSheet, {
  FilterBottomSheetRef,
} from "../../src/modals/shop/FilterBottomSheet";
import SortBottomSheet, {
  SortBottomSheetRef,
} from "../../src/modals/shop/SortBottomSheet";
import ProductCard from "../../src/components/comman/ProductCard";
import { ListingItem } from "../../src/types/shop.types";
import { useLocalSearchParams } from "expo-router";
import { useAddToCart } from "../../src/hooks/cartHooks";
import { useAppVisitorStore } from "../../src/store/auth";

type GridMode = "grid" | "list";

const DEFAULT_PRICE = { from: 200, to: 50000 };

export default function ShopScreen() {
  const { search } = useLocalSearchParams();
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();
  const { width } = useWindowDimensions();

  const { addToCart } = useAddToCart();
  const visitorId = useAppVisitorStore((state) => state.visitorId);

  const [gridMode, setGridMode] = useState<GridMode>("list");
  const [sortBy, setSortBy] = useState<number>(1);
  const [priceFilter, setPriceFilter] = useState(DEFAULT_PRICE);

  const searchText = Array.isArray(search) ? search[0] : search;

  const filterRef = useRef<FilterBottomSheetRef>(null);
  const sortRef = useRef<SortBottomSheetRef>(null);
  const momentumRef = useRef(false);

  const { products, loading, loadingMore, hasMore, allLoaded, loadMore } =
    useListing({
      sort_by: sortBy,
      type: searchText || "",
      filter_from_price: priceFilter.from,
      filter_to_price: priceFilter.to,
    });

  const isGrid = gridMode === "grid";

  const isFilterActive =
    priceFilter.from !== DEFAULT_PRICE.from ||
    priceFilter.to !== DEFAULT_PRICE.to;

  const isSortActive = sortBy !== 1;

  // ✅ GRID WIDTH FIX
  const ITEM_WIDTH = useMemo(() => {
    const H_PADDING = spacing(24); // 12 * 2
    const GAP = spacing(10);
    return (width - H_PADDING - GAP) / 2;
  }, [width, spacing]);

  // ── Handlers ─────────────────
  const toggleGridMode = useCallback(() => {
    setGridMode((p) => (p === "grid" ? "list" : "grid"));
  }, []);

  const handleSortSelect = useCallback((id: number) => setSortBy(id), []);

  const handleApplyFilter = useCallback((filters: any) => {
    setPriceFilter({
      from: filters.priceRange.min,
      to: filters.priceRange.max,
    });
  }, []);

  const onMomentumScrollBegin = useCallback(() => {
    momentumRef.current = false;
  }, []);

  const onEndReached = useCallback(() => {
    if (!momentumRef.current && hasMore && !loadingMore) {
      loadMore();
      momentumRef.current = true;
    }
  }, [hasMore, loadingMore, loadMore]);

  const renderItem: ListRenderItem<ListingItem> = useCallback(
    ({ item }) => {
      if (isGrid) {
        return (
          <View style={{ width: ITEM_WIDTH }}>
            <ProductCard item={item} mode="grid" onAddToCart={handleAddToCart} />
          </View>
        );
      }
      return <ProductCard item={item} mode="list" onAddToCart={handleAddToCart} />;
    },
    [isGrid, ITEM_WIDTH],
  );


  const handleAddToCart = useCallback(
  (item: ListingItem, qty: number) => {
    if (!visitorId) return;

    addToCart({
      visitor_id: visitorId,
      product_id: item.id,
      qty: qty,
    });
  },
  [visitorId]
);
  const PAD = spacing(12);
  const GAP = spacing(10);

  const contentContainerStyle = useMemo(
    () => ({
      padding: PAD,
      flexGrow: 1,
    }),
    [PAD],
  );

  const keyExtractor = useCallback(
    (item: ListingItem, index: number) => `${item.id}_${index}`,
    [],
  );

  // ── Empty ──
  const ListEmpty = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    return (
      <View style={styles.centered}>
        <Text
          style={{
            fontSize: font(13),
            color: colors.textTertiary,
          }}
        >
          No products found
        </Text>
      </View>
    );
  }, [loading, colors, font]);

  // ── Footer ──
  const ListFooter = useMemo(() => {
    if (loadingMore) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }

    if (allLoaded) {
      return (
        <View style={styles.footer}>
          <Text
            style={{
              fontFamily: "Poppins_500Medium",
              fontSize: font(12),
              color: colors.textTertiary,
            }}
          >
            All items loaded
          </Text>
        </View>
      );
    }

    return null;
  }, [allLoaded, loadingMore, colors.primary, colors.textTertiary, font]);

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <AppNavbar title="Shop" showBack />

      {/* Toolbar */}
      <View
        style={[
          styles.toolbar,
          {
            paddingHorizontal: spacing(16),
            paddingVertical: spacing(10),
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            gap: spacing(10),
          },
        ]}
      >
        {/* Count */}
        <Text
          style={{
            fontFamily: "Poppins_400Regular",
            fontSize: font(13),
            color: colors.textSecondary,
            flex: 1,
          }}
        >
          <Text
            style={{
              fontFamily: "Poppins_600SemiBold",
              color: colors.text,
            }}
          >
            {loading ? "—" : products.length}{" "}
          </Text>
          Products
        </Text>

        {/* ── Actions ── */}
        <View style={[styles.actions, { gap: spacing(8) }]}>
          {/* Grid / List toggle */}
          <TouchableOpacity
            onPress={toggleGridMode}
            style={[
              styles.pill,
              {
                paddingHorizontal: spacing(10),
                paddingVertical: spacing(7),
                borderRadius: spacing(20),
                borderColor: colors.primary,
                backgroundColor: colors.primary + "12",
                gap: spacing(4),
              },
            ]}
          >
            {isGrid ? (
              <LayoutGrid size={spacing(15)} color={colors.primary} />
            ) : (
              <List size={spacing(15)} color={colors.primary} />
            )}
            <Text
              style={{
                fontFamily: "Poppins_500Medium",
                fontSize: font(12),
                color: colors.primary,
                includeFontPadding: false,
              }}
            >
              {isGrid ? "Grid" : "List"}
            </Text>
          </TouchableOpacity>

          {/* Filter */}
          <TouchableOpacity
            onPress={() => filterRef.current?.open()}
            style={[
              styles.pill,
              {
                paddingHorizontal: spacing(10),
                paddingVertical: spacing(7),
                borderRadius: spacing(20),
                gap: spacing(4),
                borderColor: isFilterActive ? colors.primary : colors.border,
                backgroundColor: isFilterActive
                  ? colors.primary + "12"
                  : "transparent",
              },
            ]}
          >
            <SlidersHorizontal
              size={spacing(15)}
              color={isFilterActive ? colors.primary : colors.textSecondary}
            />
            <Text
              style={{
                fontFamily: "Poppins_500Medium",
                fontSize: font(12),
                color: isFilterActive ? colors.primary : colors.text,
                includeFontPadding: false,
              }}
            >
              Filter
            </Text>
          </TouchableOpacity>

          {/* Sort */}
          <TouchableOpacity
            onPress={() => sortRef.current?.open()}
            style={[
              styles.pill,
              {
                paddingHorizontal: spacing(10),
                paddingVertical: spacing(7),
                borderRadius: spacing(20),
                gap: spacing(4),
                borderColor: isSortActive ? colors.primary : colors.border,
                backgroundColor: isSortActive
                  ? colors.primary + "12"
                  : "transparent",
              },
            ]}
          >
            <ArrowDownUp
              size={spacing(15)}
              color={isSortActive ? colors.primary : colors.textSecondary}
            />
            <Text
              style={{
                fontFamily: "Poppins_500Medium",
                fontSize: font(12),
                color: isSortActive ? colors.primary : colors.text,
                includeFontPadding: false,
              }}
            >
              Sort
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* LIST */}
      <FlatList
        key={gridMode} // 🔥 MUST
        data={products}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={isGrid ? 2 : 1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}
        columnWrapperStyle={
          isGrid
            ? { justifyContent: "space-between", marginBottom: GAP }
            : undefined
        }
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.6}
        onMomentumScrollBegin={onMomentumScrollBegin}
        removeClippedSubviews={isGrid}
      />

      <FilterBottomSheet ref={filterRef} onApply={handleApplyFilter} />
      <SortBottomSheet
        ref={sortRef}
        selected={sortBy}
        onSelect={handleSortSelect}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
  },
});
