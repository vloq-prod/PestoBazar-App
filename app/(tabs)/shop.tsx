import { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ListRenderItem,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../src/theme";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { navbarConfig } from "../../src/config/navbarConfig";
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
import ShopItemCard from "../../src/components/comman/ShopItemCard";
import { ListingItem } from "../../src/types/shop.types";
import { useLocalSearchParams } from "expo-router";

type GridMode = "grid" | "list";

export default function ShopScreen() {
  const { search } = useLocalSearchParams();
  const { colors } = useTheme();
  const [gridMode, setGridMode] = useState<GridMode>("grid");
  const [sortBy, setSortBy] = useState<number>(1);

  // ✅ Price filter state add karo
  const [priceFilter, setPriceFilter] = useState<{
    from: number;
    to: number;
  }>({
    from: 200,
    to: 50000,
  });

  console.log("price filter: ", priceFilter)

  const searchText = Array.isArray(search) ? search[0] : search;

  const filterRef = useRef<FilterBottomSheetRef>(null);
  const sortRef = useRef<SortBottomSheetRef>(null);

  // ✅ priceFilter useListing mein pass karo
  const { products, loading, loadingMore, hasMore, loadMore } = useListing({
    sort_by: sortBy,
    type: searchText || "",
    filter_from_price: priceFilter.from,
    filter_to_price: priceFilter.to,
  });

  const onEndReachedCalledDuringMomentum = useRef(false);
  const isGrid = gridMode === "grid";

  const toggleGridMode = useCallback(() => {
    setGridMode((p) => (p === "grid" ? "list" : "grid"));
  }, []);

  const handleSortSelect = useCallback((id: number) => setSortBy(id), []);

  // ✅ onApply mein price set karo
  const handleApplyFilter = useCallback(
    (filters: {
      categories: number[];
      brands: number[];
      priceRange: { min: number; max: number };
    }) => {
      console.log("Applied filters:", filters);
      setPriceFilter({
        from: filters.priceRange.min,
        to: filters.priceRange.max,
      });
    },
    [],
  );

  const numColumns = isGrid ? 2 : 1;

  const columnWrapperStyle = useMemo(
    () => (isGrid ? { gap: 10 } : undefined),
    [isGrid],
  );

  const contentContainerStyle = useMemo(() => ({ padding: 13, gap: 10 }), []);

  const renderItem: ListRenderItem<ListingItem> = useCallback(
    ({ item }) => <ShopItemCard item={item} mode={gridMode} />,
    [gridMode],
  );

  const keyExtractor = useCallback(
    (item: ListingItem) => item.id.toString(),
    [],
  );

  const onMomentumScrollBegin = useCallback(() => {
    onEndReachedCalledDuringMomentum.current = false;
  }, []);

  const onEndReached = useCallback(() => {
    if (!onEndReachedCalledDuringMomentum.current && hasMore && !loadingMore) {
      loadMore();
      onEndReachedCalledDuringMomentum.current = true;
    }
  }, [hasMore, loadingMore, loadMore]);

  const ListEmpty = useMemo(
    () =>
      loading ? (
        <View className="items-center justify-center py-20">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : null,
    [loading, colors.primary],
  );

  const ListFooter = useMemo(() => {
    if (loadingMore) {
      return (
        <View className="items-center py-6">
          <ActivityIndicator size="small" color={colors.primary} />
          <Text
            className="mt-2 text-[11px]"
            style={{
              fontFamily: "Poppins_400Regular",
              color: colors.textTertiary,
            }}
          >
            Loading more...
          </Text>
        </View>
      );
    }
    if (!hasMore && products.length > 0) {
      return (
        <Text
          className="text-center py-5 text-[12px]"
          style={{
            fontFamily: "Poppins_400Regular",
            color: colors.textTertiary,
          }}
        >
          All products loaded ✓
        </Text>
      );
    }
    return null;
  }, [loadingMore, hasMore, products.length, colors.primary, colors.textTertiary]);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={["top"]}
    >
      <AppNavbar {...navbarConfig.shop} />

      {/* ── Filter Bar ── */}
      <View
        className="flex-row items-center justify-between px-4 py-2.5 border-b"
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        }}
      >
        {/* Product count */}
        <Text
          className="text-[13px]"
          style={{
            fontFamily: "Poppins_400Regular",
            color: colors.textSecondary,
          }}
        >
          <Text
            style={{ fontFamily: "Poppins_600SemiBold", color: colors.text }}
          >
            {loading ? "..." : products.length}{" "}
          </Text>
          Products
        </Text>

        <View className="flex-row items-center gap-2">
          {/* Grid / List toggle */}
          <TouchableOpacity
            onPress={toggleGridMode}
            className="w-9 h-9 rounded-full border items-center justify-center"
            style={{
              borderColor: colors.primary,
              backgroundColor: colors.primary + "15",
            }}
          >
            {isGrid ? (
              <LayoutGrid size={17} color={colors.primary} />
            ) : (
              <List size={17} color={colors.primary} />
            )}
          </TouchableOpacity>

          {/* Filter — ✅ active indicator jab price filter laga ho */}
          <TouchableOpacity
            onPress={() => filterRef.current?.open()}
            className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border"
            style={{
              borderColor:
                priceFilter.from > 0 || priceFilter.to > 0
                  ? colors.primary
                  : colors.border,
              backgroundColor:
                priceFilter.from > 0 || priceFilter.to > 0
                  ? colors.primary + "12"
                  : colors.background,
            }}
          >
            <SlidersHorizontal
              size={15}
              color={
                priceFilter.from > 0 || priceFilter.to > 0
                  ? colors.primary
                  : colors.textSecondary
              }
            />
            <Text
              className="text-[12px]"
              style={{
                fontFamily: "Poppins_500Medium",
                color:
                  priceFilter.from > 0 || priceFilter.to > 0
                    ? colors.primary
                    : colors.text,
              }}
            >
              Filter
            </Text>
          </TouchableOpacity>

          {/* Sort */}
          <TouchableOpacity
            onPress={() => sortRef.current?.open()}
            className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border"
            style={{
              borderColor: sortBy !== 1 ? colors.primary : colors.border,
              backgroundColor:
                sortBy !== 1 ? colors.primary + "12" : colors.background,
            }}
          >
            <ArrowDownUp
              size={15}
              color={sortBy !== 1 ? colors.primary : colors.textSecondary}
            />
            <Text
              className="text-[12px]"
              style={{
                fontFamily: "Poppins_500Medium",
                color: sortBy !== 1 ? colors.primary : colors.text,
              }}
            >
              Sort
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        key={gridMode}
        data={products}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={false}
        windowSize={10}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        contentContainerStyle={contentContainerStyle}
        columnWrapperStyle={columnWrapperStyle}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        onMomentumScrollBegin={onMomentumScrollBegin}
        onEndReached={onEndReached}
        renderItem={renderItem}
      />

      {/* ✅ handleApplyFilter pass karo */}
      <FilterBottomSheet
        ref={filterRef}
        onApply={handleApplyFilter}
      />
      <SortBottomSheet
        ref={sortRef}
        selected={sortBy}
        onSelect={handleSortSelect}
      />
    </SafeAreaView>
  );
}
