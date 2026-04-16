import React, {
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { X, Plus } from "lucide-react-native";
import { useTheme } from "../../theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PriceSlider from "../../components/comman/PriceSlider"; // ✅ sirf PriceSlider import

const INITIAL_SHOW = 10;

export interface FilterBottomSheetRef {
  open: () => void;
  close: () => void;
}

interface Props {
  onApply?: (filters: {
    categories: number[];
    brands: number[];
    priceRange: { min: number; max: number }; // ✅ price bhi onApply mein
  }) => void;
}

export const categories = [
  { id: 1, name: "Rat Control" },
  { id: 2, name: "Lizard Control" },
  { id: 3, name: "Snake Control" },
  { id: 4, name: "Cockroach Control" },
  { id: 5, name: "Termite Control" },
  { id: 6, name: "Mosquito Control" },
  { id: 7, name: "Bed Bug Control" },
  { id: 8, name: "Ant Control" },
  { id: 9, name: "Fly Control" },
  { id: 10, name: "Spider Control" },
  { id: 11, name: "Bird Control" },
  { id: 12, name: "Bee Control" },
  { id: 13, name: "Flea Control" },
  { id: 14, name: "Tick Control" },
  { id: 15, name: "Silverfish Control" },
];

export const brands = [
  { id: 1, name: "Hit" },
  { id: 2, name: "Goodknight" },
  { id: 3, name: "All Out" },
  { id: 4, name: "Mortein" },
  { id: 5, name: "Baygon" },
  { id: 6, name: "Raid" },
  { id: 7, name: "Ortho" },
  { id: 8, name: "Harris" },
  { id: 9, name: "Combat" },
  { id: 10, name: "EcoSMART" },
  { id: 11, name: "Green Gobbler" },
  { id: 12, name: "Safer Brand" },
  { id: 13, name: "Hot Shot" },
  { id: 14, name: "Spectracide" },
  { id: 15, name: "Black Flag" },
];

// ── FilterSection ─────────────────────────────────────────
const FilterSection = ({
  title,
  items,
  selectedSet,
  onToggle,
  colors,
}: {
  title: string;
  items: { id: number; name: string }[];
  selectedSet: Set<number>;
  onToggle: (id: number) => void;
  colors: any;
}) => {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? items : items.slice(0, INITIAL_SHOW);

  return (
    <View className="gap-2.5">
      <Text
        className="text-[11px] tracking-widest uppercase"
        style={{
          fontFamily: "Poppins_600SemiBold",
          color: colors.textSecondary,
        }}
      >
        {title}
      </Text>

      <View className="flex-row flex-wrap gap-2">
        {visible.map((item) => {
          const selected = selectedSet.has(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onToggle(item.id)}
              activeOpacity={0.7}
              className="flex-row items-center gap-1 py-1.5 pl-3 pr-2 rounded-lg border"
              style={{
                borderColor: selected ? colors.primary : colors.border,
                backgroundColor: selected
                  ? colors.primary + "15"
                  : colors.background,
              }}
            >
              <Text
                className="text-[12px]"
                style={{
                  fontFamily: selected
                    ? "Poppins_600SemiBold"
                    : "Poppins_400Regular",
                  color: selected ? colors.primary : colors.textSecondary,
                }}
              >
                {item.name}
              </Text>
              {selected ? (
                <X size={13} color={colors.primary} strokeWidth={2.5} />
              ) : (
                <Plus
                  size={13}
                  color={colors.textSecondary}
                  strokeWidth={2.5}
                />
              )}
            </TouchableOpacity>
          );
        })}

        {!showAll && items.length > INITIAL_SHOW && (
          <TouchableOpacity
            onPress={() => setShowAll(true)}
            activeOpacity={0.7}
            className="py-1.5 px-3 rounded-lg border"
            style={{
              borderColor: colors.primary,
              backgroundColor: colors.primary + "10",
            }}
          >
            <Text
              className="text-[12px]"
              style={{ fontFamily: "Poppins_500Medium", color: colors.primary }}
            >
              +{items.length - INITIAL_SHOW} More
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ── Main ──────────────────────────────────────────────────
const FilterBottomSheet = React.forwardRef<FilterBottomSheetRef, Props>(
  ({onApply}, ref) => {
    const {colors} = useTheme();
    const insets = useSafeAreaInsets();
    const sheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['80%'], []);
    const stableColors = useMemo(() => colors, [colors]);

    const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
    const [selectedBrands, setSelectedBrands] = useState<Set<number>>(new Set());
    const [priceRange, setPriceRange] = useState<{min: number; max: number}>({
      min: 200,
      max: 50_000,
    });

 
    const [openKey, setOpenKey] = useState(0);

    useImperativeHandle(ref, () => ({
      open: () => {
        setOpenKey(k => k + 1); 
        sheetRef.current?.present();
      },
      close: () => sheetRef.current?.dismiss(),
    }));

    const toggleCategory = useCallback((id: number) => {
      setSelectedCategories(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    }, []);

    const toggleBrand = useCallback((id: number) => {
      setSelectedBrands(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    }, []);

    const handleClearAll = useCallback(() => {
      setSelectedCategories(new Set());
      setSelectedBrands(new Set());
      setPriceRange({min: 200, max: 50_000});
      setOpenKey(k => k + 1); // ✅ slider bhi reset ho
    }, []);

    const handleApply = useCallback(() => {
      onApply?.({
        categories: Array.from(selectedCategories),
        brands: Array.from(selectedBrands),
        priceRange,
      });
      sheetRef.current?.dismiss();
    }, [onApply, selectedCategories, selectedBrands, priceRange]);

    const totalSelected = selectedCategories.size + selectedBrands.size;

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        handleComponent={null}
        backgroundStyle={{
          backgroundColor: stableColors.background,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}>
        {/* Header — same as before */}
        <View
          className="flex-row items-center justify-between px-4 py-3 border-b rounded-t-2xl"
          style={{
            borderBottomColor: stableColors.border,
            backgroundColor: stableColors.primary,
          }}>
          <Text
            className="text-[17px]"
            style={{fontFamily: 'Poppins_600SemiBold', color: stableColors.textInverse}}>
            Filter Products
          </Text>
          <TouchableOpacity
            onPress={() => sheetRef.current?.dismiss()}
            className="w-8 h-8 items-center justify-center rounded-full"
            style={{backgroundColor: 'rgba(255,255,255,0.2)'}}>
            <X size={18} color={stableColors.textInverse} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        <BottomSheetScrollView
          contentContainerStyle={{padding: 16, gap: 22, paddingBottom: 20}}
          showsVerticalScrollIndicator={false}>

          <FilterSection
            title="Category"
            items={categories}
            selectedSet={selectedCategories}
            onToggle={toggleCategory}
            colors={stableColors}
          />

          <FilterSection
            title="Brand"
            items={brands}
            selectedSet={selectedBrands}
            onToggle={toggleBrand}
            colors={stableColors}
          />

          <View className="gap-2.5">
            <Text
              className="text-[11px] tracking-widest uppercase"
              style={{fontFamily: 'Poppins_600SemiBold', color: stableColors.textSecondary}}>
              Price
            </Text>

            {/* ✅ key={openKey} — har open pe remount with saved priceRange */}
            {/* ✅ initialMin/initialMax — apply ke baad wahi values dikhengi */}
            <PriceSlider
              key={openKey}
              initialMin={priceRange.min}
              initialMax={priceRange.max}
              onValueChange={range => setPriceRange(range)}
            />
          </View>
        </BottomSheetScrollView>

        {/* Footer — same as before */}
        <View
          className="flex-row gap-2.5 px-4 pt-3 border-t"
          style={{
            paddingBottom: insets.bottom || 20,
            backgroundColor: stableColors.background,
            borderTopColor: stableColors.border,
          }}>
          <TouchableOpacity
            onPress={handleClearAll}
            className="flex-1 items-center justify-center py-3.5 rounded-xl border"
            style={{borderColor: stableColors.border, backgroundColor: stableColors.surface}}>
            <Text
              className="text-[14px]"
              style={{fontFamily: 'Poppins_500Medium', color: stableColors.textSecondary}}>
              Clear All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleApply}
            className="flex-1 items-center justify-center py-3.5 rounded-xl"
            style={{backgroundColor: stableColors.primary}}>
            <Text
              className="text-[14px] text-white"
              style={{fontFamily: 'Poppins_600SemiBold'}}>
              {totalSelected > 0
                ? `Apply ${totalSelected} Filter${totalSelected > 1 ? 's' : ''}`
                : 'Apply Filter'}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetModal>
    );
  },
);

FilterBottomSheet.displayName = "FilterBottomSheet";
export default FilterBottomSheet;
