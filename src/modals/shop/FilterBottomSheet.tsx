import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  useCallback,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Pressable,
} from "react-native";
import { X, Search } from "lucide-react-native";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PriceSlider from "../../components/comman/PriceSlider";
import { useFilterData } from "../../hooks/shopHooks";

// ─── Types ────────────────────────────────────────────────────
export interface FilterBottomSheetRef {
  open: () => void;
  close: () => void;
}

interface FilterState {
  categories: number[];
  brands: number[];
  priceRange: { min: number; max: number };
}

interface Props {
  onApply?: (filters: FilterState) => void;
}

type SectionKey = "category" | "brand" | "price";

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "category", label: "Category" },
  { key: "brand", label: "Brands" },
  { key: "price", label: "Price" },
];

// ─── Checkbox Row ─────────────────────────────────────────────
const CheckRow = React.memo(
  ({
    label,
    checked,
    onToggle,
    colors,
    font,
    spacing,
  }: {
    label: string;
    checked: boolean;
    onToggle: () => void;
    colors: any;
    font: any;
    spacing: any;
  }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onToggle}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing(11),
        paddingHorizontal: spacing(14),
        gap: spacing(10),
        backgroundColor: checked ? colors.backgroundgray : colors.background,
      }}
    >
      {/* Checkbox */}
      <View
        style={{
          width: spacing(18),
          height: spacing(18),
          borderRadius: spacing(5),
          borderWidth: checked ? 0 : 1.5,
          borderColor: colors.border,
          backgroundColor: checked ? colors.primary : "transparent",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {checked && (
          <View
            style={{
              width: spacing(10),
              height: spacing(10),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Checkmark via borders */}
            <View
              style={{
                width: spacing(9),
                height: spacing(5),
                borderLeftWidth: 1.5,
                borderBottomWidth: 1.5,
                borderColor: colors.background,
                transform: [{ rotate: "-45deg" }, { translateY: -spacing(1) }],
              }}
            />
          </View>
        )}
      </View>

      <Text
        numberOfLines={1}
        style={{
          flex: 1,
          fontSize: font(12),
          fontFamily: checked ? "Poppins_500Medium" : "Poppins_400Regular",
          color: checked ? colors.primary : colors.textSecondary,
          includeFontPadding: false,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  ),
);

CheckRow.displayName = "CheckRow";

// ─── Search Input ─────────────────────────────────────────────
const SearchBar = ({
  value,
  onChange,
  placeholder,
  colors,
  font,
  spacing,
}: any) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      margin: spacing(10),
      paddingVertical: spacing(10),
      paddingHorizontal: spacing(10),
      backgroundColor: colors.backgroundgray,
      borderRadius: spacing(8),
      borderWidth: 0.5,
      borderColor: colors.border,
      gap: spacing(8),
    }}
  >
    <Search size={font(14)} color={colors.textTertiary} strokeWidth={2} />
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.textTertiary}
      style={{
        flex: 1,
        fontSize: font(12),
        fontFamily: "Poppins_400Regular",
        color: colors.text,
        paddingVertical: spacing(8),
        includeFontPadding: false,
        paddingTop: 0,
        paddingBottom: 0,
      }}
    />
    {!!value && (
      <TouchableOpacity onPress={() => onChange("")} activeOpacity={0.7}>
        <X size={14} color={colors.textTertiary} />
      </TouchableOpacity>
    )}
  </View>
);

// ─── Main Component ───────────────────────────────────────────
const FilterBottomSheet = React.forwardRef<FilterBottomSheetRef, Props>(
  ({ onApply }, ref) => {
    const { colors } = useTheme();
    const { font, spacing } = useResponsive();
    const insets = useSafeAreaInsets();
    const [visible, setVisible] = useState(false);

    // ── API ──────────────────────────────────────────────────
    const { data } = useFilterData();
    const categories = useMemo(
      () => data?.data?.category ?? [],
      [data?.data?.category],
    );
    const brands = useMemo(() => data?.data?.brand ?? [], [data?.data?.brand]);
    const priceMin = Number(data?.data?.price?.min ?? 100);
    const priceMax = Number(data?.data?.price?.max ?? 50000);

    // ── State ────────────────────────────────────────────────
    const [activeSection, setActiveSection] = useState<SectionKey>("category");
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
    const [priceRange, setPriceRange] = useState({
      min: priceMin,
      max: priceMax,
    });
    const [categorySearch, setCategorySearch] = useState("");
    const [brandSearch, setBrandSearch] = useState("");
    const [openKey, setOpenKey] = useState(0);

    useEffect(() => {
      setPriceRange({ min: priceMin, max: priceMax });
    }, [priceMin, priceMax]);

    // ── Derived ──────────────────────────────────────────────
    const filteredCategories = useMemo(
      () =>
        categories.filter((c: any) =>
          c.category_name.toLowerCase().includes(categorySearch.toLowerCase()),
        ),
      [categories, categorySearch],
    );

    const filteredBrands = useMemo(
      () =>
        brands.filter((b: any) =>
          b.brand_name.toLowerCase().includes(brandSearch.toLowerCase()),
        ),
      [brands, brandSearch],
    );

    // ── Handlers ─────────────────────────────────────────────
    const toggleCategory = useCallback((id: number) => {
      setSelectedCategories((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    }, []);

    const toggleBrand = useCallback((id: number) => {
      setSelectedBrands((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    }, []);

    const handleClear = useCallback(() => {
      setSelectedCategories([]);
      setSelectedBrands([]);
      setPriceRange({ min: priceMin, max: priceMax });
      setCategorySearch("");
      setBrandSearch("");
    }, [priceMin, priceMax]);

    const handleApply = useCallback(() => {
      onApply?.({
        categories: selectedCategories,
        brands: selectedBrands,
        priceRange,
      });
      setVisible(false);
    }, [selectedCategories, selectedBrands, priceRange, onApply]);

    useImperativeHandle(ref, () => ({
      open: () => {
        setOpenKey((k) => k + 1);
        setVisible(true);
      },
      close: () => setVisible(false),
    }));

    // ── Right panel content ──────────────────────────────────
    const renderContent = () => {
      if (activeSection === "price") {
        return (
          <View style={{ padding: spacing(16) }}>
            <PriceSlider
              key={openKey}
              min={priceMin}
              max={priceMax}
              initialMin={priceRange.min}
              initialMax={priceRange.max}
              onValueChange={setPriceRange}
            />
          </View>
        );
      }

      const isCategory = activeSection === "category";
      const items = isCategory ? filteredCategories : filteredBrands;
      const selected = isCategory ? selectedCategories : selectedBrands;
      const onToggle = isCategory ? toggleCategory : toggleBrand;
      const getLabel = (item: any) =>
        isCategory ? item.category_name : item.brand_name;
      const getId = (item: any) => item.id;

      return (
        <>
          <SearchBar
            value={isCategory ? categorySearch : brandSearch}
            onChange={isCategory ? setCategorySearch : setBrandSearch}
            placeholder={`Search ${isCategory ? "category" : "brand"}...`}
            colors={colors}
            font={font}
            spacing={spacing}
          />
          <ScrollView
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
            indicatorStyle="default"
          >
            {items.map((item: any, index: number) => (
              <React.Fragment key={getId(item)}>
                <CheckRow
                  label={getLabel(item)}
                  checked={selected.includes(getId(item))}
                  onToggle={() => onToggle(getId(item))}
                  colors={colors}
                  font={font}
                  spacing={spacing}
                />
                {index < items.length - 1 && (
                  <View
                    style={{ height: 0.5, backgroundColor: colors.border }}
                  />
                )}
              </React.Fragment>
            ))}
          </ScrollView>
        </>
      );
    };

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: colors.overlay,
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={() => setVisible(false)} />
          <View
            style={{
              height: "70%",
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,

              overflow: "visible",
            }}
          >
            <View
              style={{
                position: "absolute",
                top: -spacing(50),
                left: 0,
                right: 0,
                alignItems: "center",
                zIndex: 10,
              }}
            >
              <TouchableOpacity
                onPress={() => setVisible(false)}
                activeOpacity={0.8}
                style={{
                  width: spacing(36),
                  height: spacing(36),
                  borderRadius: spacing(18),
                  backgroundColor: colors.background,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 0.5,
                  borderColor: colors.border,
                  elevation: 5,
                  shadowColor: "#000",
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 3 },
                }}
              >
                <X size={font(16)} color={colors.text} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            {/* ── Header ── */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: spacing(16),
                paddingVertical: spacing(14),
                borderTopColor: colors.border,
                borderBottomWidth: 0.5,
                borderBottomColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: font(15),
                  fontFamily: "Poppins_600SemiBold",
                  color: colors.text,
                  includeFontPadding: false,
                }}
              >
                Filter Products
              </Text>
            </View>

            {/* ── Body: Sidebar + Content ── */}
            <View style={{ flex: 1, flexDirection: "row" }}>
              {/* Left Sidebar — 28% */}
              <View
                style={{
                  width: "31%",
                  borderRightWidth: 0.5,
                  borderRightColor: colors.border,
                  backgroundColor: colors.backgroundgray,
                }}
              >
                {SECTIONS.map(({ key, label }) => {
                  const isActive = activeSection === key;
                  const count =
                    key === "category"
                      ? selectedCategories.length
                      : key === "brand"
                        ? selectedBrands.length
                        : 0;

                  return (
                    <TouchableOpacity
                      key={key}
                      activeOpacity={0.7}
                      onPress={() => setActiveSection(key)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        minHeight: spacing(50),
                        backgroundColor: isActive
                          ? colors.background
                          : "transparent",
                        borderBottomWidth: 0.5,
                        borderBottomColor: colors.border,
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingVertical: spacing(14),
                          paddingHorizontal: spacing(12),
                          gap: spacing(8),
                        }}
                      >
                        <Text
                          numberOfLines={2}
                          style={{
                            flex: 1,
                            fontSize: font(12),
                            fontFamily: isActive
                              ? "Poppins_600SemiBold"
                              : "Poppins_400Regular",
                            color: isActive
                              ? colors.primary
                              : colors.textSecondary,
                            includeFontPadding: false,
                          }}
                        >
                          {label}
                        </Text>

                        {count > 0 && (
                          <View
                            style={{
                              minWidth: spacing(16),
                              height: spacing(16),
                              borderRadius: spacing(8),
                              backgroundColor: colors.primary,
                              alignItems: "center",
                              justifyContent: "center",
                              paddingHorizontal: spacing(4),
                            }}
                          >
                            <Text
                              style={{
                                fontSize: font(9),
                                fontFamily: "Poppins_700Bold",
                                color: colors.textOnPrimary,
                                includeFontPadding: false,
                              }}
                            >
                              {count}
                            </Text>
                          </View>
                        )}
                      </View>

                      {isActive && (
                        <View
                          style={{
                            width: spacing(4),
                            alignSelf: "stretch",
                            backgroundColor: colors.primary,
                            borderTopLeftRadius: spacing(6),
                            borderBottomLeftRadius: spacing(6),
                          }}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Right Content — 72% */}
              <View style={{ flex: 1, backgroundColor: colors.background }}>
                {renderContent()}
              </View>
            </View>

            {/* ── Sticky Footer ── */}
            <View
              style={{
                flexDirection: "row",
                gap: spacing(10),
                padding: spacing(12),
                paddingBottom: Math.max(insets.bottom, spacing(12)),
                borderTopWidth: 0.5,
                borderTopColor: colors.border,
                backgroundColor: colors.background,
              }}
            >
              <TouchableOpacity
                onPress={handleClear}
                activeOpacity={0.75}
                style={{
                  flex: 1,
                  paddingVertical: spacing(13),
                  borderRadius: spacing(10),
                  borderWidth: 0.5,
                  borderColor: colors.border,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: font(13),
                    fontFamily: "Poppins_500Medium",
                    color: colors.textSecondary,
                    includeFontPadding: false,
                  }}
                >
                  Clear all
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleApply}
                activeOpacity={0.85}
                style={{
                  flex: 2,
                  paddingVertical: spacing(13),
                  borderRadius: spacing(10),
                  backgroundColor: colors.primary,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: font(13),
                    fontFamily: "Poppins_600SemiBold",
                    color: colors.textOnPrimary,
                    includeFontPadding: false,
                  }}
                >
                  Apply Filters
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  },
);

FilterBottomSheet.displayName = "FilterBottomSheet";
export default FilterBottomSheet;
