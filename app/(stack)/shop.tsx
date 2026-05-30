import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  ArrowUpRight,
  X,
  SlidersHorizontal,
  ArrowDownUp,
  Tag,
} from "lucide-react-native";
import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";
import { useSearchSuggestions } from "../../src/hooks/searchHooks";
import { useListing } from "../../src/hooks/shopHooks";
import { useCartCount } from "../../src/hooks/cartHooks";
import { useAppVisitorStore } from "../../src/store/auth";
import { ListingItem } from "../../src/types/shop.types";
import ListingGridCard from "../../src/components/ProductCard/GridCard";
import SearchItem from "../../src/components/search/SearchItem";
import FilterBottomSheet, {
  FilterBottomSheetRef,
} from "../../src/modals/shop/FilterBottomSheet";
import SortBottomSheet, {
  SortBottomSheetRef,
} from "../../src/modals/shop/SortBottomSheet";
import AddToCartPreview from "../../src/components/cart/AddToCartPreview";

const DEFAULT_PRICE = { from: 200, to: 50000 };

export default function ShopScreen() {
  const { search } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const inputRef = useRef<TextInput>(null);
  const filterRef = useRef<FilterBottomSheetRef>(null);
  const sortRef = useRef<SortBottomSheetRef>(null);
  const [sortBy, setSortBy] = useState(1);
  const [priceFilter, setPriceFilter] = useState(DEFAULT_PRICE);
  const [appliedFilters, setAppliedFilters] = useState<{
    categories: number[];
    brands: number[];
    priceRange: { min: number; max: number };
  }>({
    categories: [],
    brands: [],
    priceRange: { min: DEFAULT_PRICE.from, max: DEFAULT_PRICE.to },
  });

  const handleApplyFilter = useCallback(
    (filters: {
      categories: number[];
      brands: number[];
      priceRange: { min: number; max: number };
    }) => {
      setAppliedFilters(filters);
      setPriceFilter({
        from: filters.priceRange.min,
        to: filters.priceRange.max,
      });
    },
    [],
  );

  const { visitorId, userId } = useAppVisitorStore((s) => s);
  const { data: cartCountData } = useCartCount({
    user_id: userId!,
    visitor_id: visitorId!,
  });
  const cartCount = cartCountData?.data ?? 0;

  const initialQuery = Array.isArray(search) ? search[0] : (search ?? "");
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<
    string | null
  >(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<
    string | null
  >(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 400ms debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  // Reset category if user starts typing a new search
  useEffect(() => {
    if (query.trim().length > 0) {
      setSelectedCategorySlug(null);
    }
  }, [query]);

  // ── Search Suggestions API ────────────────────
  const { data: suggestionsData, isLoading: suggestionsLoading } =
    useSearchSuggestions(debouncedQuery);

  const results = suggestionsData?.data?.result ?? [];
  const productSuggestions = results.filter(
    (item: any) => item?.search_type === "product",
  );
  const categorySuggestions = results.filter(
    (item: any) => item?.search_type === "category",
  );
  const hasSuggestions =
    productSuggestions.length > 0 || categorySuggestions.length > 0;

  // Filter active when any non-default filter is selected
  const isFilterActive =
    appliedFilters.categories.length > 0 ||
    appliedFilters.brands.length > 0 ||
    priceFilter.from !== DEFAULT_PRICE.from ||
    priceFilter.to !== DEFAULT_PRICE.to;

  // ── Listing API ────────────────
  // Priority: filters > category > search
  const {
    products,
    loading: listingLoading,
    totalCount,
    loadingMore,
    allLoaded,
    loadMore,
  } = useListing({
    sort_by: sortBy,
    type: isFilterActive
      ? "filter"
      : selectedCategorySlug
        ? ""
        : debouncedQuery || "",
    category_slug: isFilterActive
      ? undefined
      : (selectedCategorySlug ?? undefined),
    filter_category_id:
      appliedFilters.categories.length > 0
        ? appliedFilters.categories.join(",")
        : undefined,
    filter_brand_id:
      appliedFilters.brands.length > 0
        ? appliedFilters.brands.join(",")
        : undefined,
    filter_from_price: priceFilter.from,
    filter_to_price: priceFilter.to,
  });

  // 3 cards per row
  const COLS = 3;
  const H_PAD = spacing(12) * 2;
  const H_GAP = spacing(10); // horizontal gap between cards
  const V_GAP = spacing(20); // vertical gap between rows
  const CARD_WIDTH = (width - H_PAD - H_GAP * (COLS - 1)) / COLS;

  // ── Section list (suggestions + results) ───────────────
  type Section =
    | { type: "suggestions" }
    | { type: "products_header" }
    | { type: "product_row"; items: ListingItem[] }
    | { type: "loading" }
    | { type: "empty" }
    | { type: "footer" };

  const listData: Section[] = useMemo(() => {
    if (!debouncedQuery.trim() && !selectedCategorySlug) return [];

    const rows: Section[] = [];

    // Suggestions block
    if (showSuggestions && !selectedCategorySlug) {
      if (suggestionsLoading || hasSuggestions) {
        rows.push({ type: "suggestions" });
      }
    }

    // Results header
    if (!showSuggestions || selectedCategorySlug) {
      rows.push({ type: "products_header" });

      if (listingLoading) {
        rows.push({ type: "loading" });
      } else if (products.length === 0) {
        rows.push({ type: "empty" });
      } else {
        for (let i = 0; i < products.length; i += COLS) {
          rows.push({
            type: "product_row",
            items: products.slice(i, i + COLS),
          });
        }
        if (loadingMore) rows.push({ type: "footer" });
      }
    }

    return rows;
  }, [
    debouncedQuery,
    selectedCategorySlug,
    showSuggestions,
    suggestionsLoading,
    hasSuggestions,
    listingLoading,
    products,
    loadingMore,
    COLS,
  ]);

  const onEndReached = useCallback(() => loadMore(), [loadMore]);

  // ── Row Renderer ──────────────────────────────
  const renderRow = ({ item }: { item: Section }) => {
    if (item.type === "suggestions") {
      return (
        <View style={{ paddingBottom: spacing(4) }}>
          {suggestionsLoading ? (
            <View
              style={{ paddingVertical: spacing(16), alignItems: "center" }}
            >
              <ActivityIndicator size="small" color={colors.textSecondary} />
            </View>
          ) : (
            <>
              {/* ── Categories first (e-commerce style rows) ── */}
              {categorySuggestions.length > 0 && (
                <View style={{ marginBottom: spacing(8) }}>
                  {categorySuggestions.map((cat: any, i: number) => (
                    <TouchableOpacity
                      key={i}
                      activeOpacity={0.75}
                      onPress={() => {
                        setSelectedCategorySlug(cat.product_url);
                        setSelectedCategoryName(cat.product_name);
                        setQuery("");
                        setShowSuggestions(false);
                        inputRef.current?.blur();
                      }}
                      style={[
                        styles.categoryRow,
                        {
                          paddingVertical: spacing(11),
                        },
                      ]}
                    >
                      {/* Category image */}
                      <View
                        style={{
                          width: spacing(40),
                          height: spacing(40),
                          borderRadius: spacing(10),
                          backgroundColor: colors.backgroundgray,
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                        }}
                      >
                        <Image
                          source={{ uri: cat.image_path }}
                          style={{ width: "80%", height: "80%" }}
                          resizeMode="contain"
                        />
                      </View>

                      {/* Name */}
                      <Text
                        numberOfLines={1}
                        style={{
                          flex: 1,
                          fontFamily: "Poppins_500Medium",
                          fontSize: font(13),
                          color: colors.text,
                        }}
                      >
                        {cat.product_name}
                      </Text>

                      {/* Arrow icon */}
                      <ArrowUpRight
                        size={spacing(16)}
                        color={colors.textTertiary}
                      />
                    </TouchableOpacity>
                  ))}
                  {/* Full width divider after last category */}
                  <View
                    style={{
                      height: 1,
                      backgroundColor: colors.border,
                      marginHorizontal: -spacing(12),
                      marginTop: spacing(4),
                    }}
                  />
                </View>
              )}

              {/* ── Products below categories (3-col grid) ── */}
              {productSuggestions.length > 0 && (
                <View style={{ paddingTop: spacing(8) }}>
                  {Array.from(
                    { length: Math.ceil(productSuggestions.length / COLS) },
                    (_, rowIdx) => {
                      const rowItems = productSuggestions.slice(
                        rowIdx * COLS,
                        rowIdx * COLS + COLS,
                      );
                      return (
                        <View
                          key={rowIdx}
                          style={{
                            flexDirection: "row",
                            gap: H_GAP,
                            marginBottom: V_GAP,
                          }}
                        >
                          {rowItems.map((s: any, i: number) => (
                            <View key={i} style={{ width: CARD_WIDTH }}>
                              <SearchItem item={s} />
                            </View>
                          ))}
                          {rowItems.length < COLS &&
                            Array.from({ length: COLS - rowItems.length }).map(
                              (_, i) => (
                                <View
                                  key={`empty-${i}`}
                                  style={{ width: CARD_WIDTH }}
                                />
                              ),
                            )}
                        </View>
                      );
                    },
                  )}
                </View>
              )}
            </>
          )}
        </View>
      );
    }

    if (item.type === "products_header") {
      let headerText = "Products";
      if (selectedCategorySlug) {
        headerText = `Category: '${selectedCategoryName || "Selected Category"}'`;
      } else if (debouncedQuery) {
        headerText = `Search by text: '${debouncedQuery}'`;
      }

      return (
        <View style={{ paddingBottom: spacing(10) }}>
          <Text
            style={[
              styles.sectionLabel,
              {
                color: colors.text,
                fontSize: font(15),
                fontFamily: "Poppins_700Bold",
              },
            ]}
          >
            {headerText}
          </Text>
        </View>
      );
    }

    if (item.type === "loading") {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="small" color={colors.textSecondary} />
        </View>
      );
    }

    if (item.type === "empty") {
      return (
        <View style={styles.center}>
          <Text
            style={{
              color: colors.textTertiary,
              fontFamily: "Poppins_400Regular",
              fontSize: font(13),
            }}
          >
            No products found
          </Text>
        </View>
      );
    }

    if (item.type === "product_row") {
      return (
        <View style={{ flexDirection: "row", gap: H_GAP, marginBottom: V_GAP }}>
          {(item as any).items.map((product: ListingItem) => (
            <View key={product.id} style={{ width: CARD_WIDTH }}>
              <ListingGridCard item={product} />
            </View>
          ))}
          {(item as any).items.length < COLS &&
            Array.from({ length: COLS - (item as any).items.length }).map(
              (_, i) => (
                <View key={`empty-${i}`} style={{ width: CARD_WIDTH }} />
              ),
            )}
        </View>
      );
    }

    if (item.type === "footer") {
      return (
        <View style={{ alignItems: "center", paddingVertical: spacing(12) }}>
          <ActivityIndicator size="small" color={colors.textSecondary} />
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
        translucent={false}
      />

      <View style={{}}>
        {/* ── Search Header ── */}
        <View
          style={[
            styles.header,
            {
              paddingHorizontal: spacing(14),
              paddingTop: spacing(10),
              paddingBottom: spacing(6),

              gap: spacing(10),
            },
          ]}
        >
          {/* Input pill */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => inputRef.current?.focus()}
            style={[
              styles.searchPill,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                paddingHorizontal: spacing(12),
                height: spacing(42),
                borderRadius: spacing(10),
                gap: spacing(8),
              },
            ]}
          >
            {/* Back button on the left inside pill */}
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={spacing(18)} color={colors.textSecondary} />
            </TouchableOpacity>

            <TextInput
              ref={inputRef}
              value={query}
              autoFocus={true}
              onChangeText={(t) => {
                setQuery(t);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onSubmitEditing={() => setShowSuggestions(false)}
              returnKeyType="search"
              placeholder="Search products, categories..."
              placeholderTextColor={colors.textTertiary}
              style={{
                flex: 1,
                height: "100%",
                fontFamily: "Poppins_400Regular",
                fontSize: font(13),
                color: colors.text,
                padding: 0,
                margin: 0,
              }}
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setQuery("");
                  setShowSuggestions(false);
                }}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={spacing(18)} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Toolbar ── */}
        {!showSuggestions &&
          (debouncedQuery.trim().length > 0 ||
            !!selectedCategorySlug ||
            isFilterActive) && (
            <View
              style={[
                styles.toolbar,
                {
                  paddingHorizontal: spacing(16),
                  paddingTop: spacing(10),
                  paddingBottom: spacing(10),
                },
              ]}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  gap: spacing(8),
                  alignItems: "center",
                }}
              >
                {/* Product count pill */}
                <View
                  style={[
                    styles.toolbarPill,
                    {
                      borderColor: colors.border,
                      borderRadius: spacing(20),
                      backgroundColor: colors.surface,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins_400Regular",
                      fontSize: font(12),
                      color: colors.textSecondary,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        color: colors.text,
                      }}
                    >
                      {listingLoading ? "—" :  totalCount}
                    </Text>{" "}
                    Products
                  </Text>
                </View>

                {/* Filter pill */}
                <TouchableOpacity
                  onPress={() => filterRef.current?.open()}
                  style={[
                    styles.toolbarPill,
                    {
                      borderColor: colors.border,
                      borderRadius: spacing(20),
                      backgroundColor: colors.surface,
                    },
                  ]}
                >
                  <SlidersHorizontal
                    size={spacing(13)}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.toolbarText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Filter
                  </Text>
                </TouchableOpacity>

                {/* Sort pill */}
                <TouchableOpacity
                  onPress={() => sortRef.current?.open()}
                  style={[
                    styles.toolbarPill,
                    {
                      borderColor: colors.border,
                      borderRadius: spacing(20),
                      backgroundColor: colors.surface,
                    },
                  ]}
                >
                  <ArrowDownUp
                    size={spacing(13)}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.toolbarText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Sort
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}
      </View>

      {/* ── Results ── */}
      <FlatList
        data={listData}
        renderItem={renderRow}
        keyExtractor={(_, i) => String(i)}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        contentContainerStyle={{
          paddingHorizontal: spacing(12),
          paddingTop: spacing(10),
          paddingBottom: insets.bottom + spacing(100),
          flexGrow: 1,
        }}
      />

      <FilterBottomSheet ref={filterRef} onApply={handleApplyFilter} />
      <SortBottomSheet
        ref={sortRef}
        selected={sortBy}
        onSelect={(id) => setSortBy(id)}
      />
      <AddToCartPreview
        pbandroid={Math.max(insets.bottom, 20) + 20}
        pbios={insets.bottom + 35}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  searchPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  sectionLabel: {
    fontFamily: "Poppins_700Bold",
    letterSpacing: 0.6,
  },
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  catCard: {
    width: "48%",
    borderWidth: 1,
    padding: 10,
  },
  catImg: {
    width: "100%",
    aspectRatio: 1.25,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toolbarPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    gap: 5,
  },
  toolbarText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Poppins_700Bold",
    includeFontPadding: false,
    textAlign: "center",
  },
});
