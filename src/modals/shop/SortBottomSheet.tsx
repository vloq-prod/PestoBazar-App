import React, {
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { X, Check } from "lucide-react-native";
import { useTheme } from "../../theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface SortBottomSheetRef {
  open: () => void;
  close: () => void;
}

interface Props {
  selected?: number;
  onSelect: (id: number) => void;
}

const SORT_OPTIONS = [
  { id: 1, label: "Popularity"        },
  { id: 2, label: "Name A to Z"       },
  { id: 3, label: "Name Z to A"       },
  { id: 4, label: "Price Low to High" },
  { id: 5, label: "Price High to Low" },
  { id: 6, label: "Top Rated"         },
] as const;

const SortBottomSheet = React.forwardRef<SortBottomSheetRef, Props>(
  ({ selected = 1, onSelect }, ref) => {
    const { colors } = useTheme();
    const insets     = useSafeAreaInsets();
    const sheetRef   = useRef<BottomSheetModal>(null);
    const stableColors = useMemo(() => colors, [colors]);

    useImperativeHandle(ref, () => ({
      open:  () => sheetRef.current?.present(),
      close: () => sheetRef.current?.dismiss(),
    }));

    const handleSelect = useCallback(
      (id: number) => {
        onSelect(id);
        sheetRef.current?.dismiss();
      },
      [onSelect],
    );

    return (
      // ✅ enableDynamicSizing — content height se auto size
      // ✅ snapPoints hataaya — 80% 6 rows ke liye bohot tha
      <BottomSheetModal
        ref={sheetRef}
        enableDynamicSizing
        enablePanDownToClose
        handleComponent={null}
        backgroundStyle={{
          backgroundColor:      stableColors.background,
          borderTopLeftRadius:  20,
          borderTopRightRadius: 20,
        }}
      >
        {/* ✅ BottomSheetView — dynamic sizing ke saath yahi use karo */}
        <BottomSheetView>
          {/* Header */}
          <View
            className="flex-row items-center justify-between px-4 py-3 border-b rounded-t-2xl"
            style={{
              borderBottomColor: stableColors.border,
              backgroundColor:   stableColors.primary,
            }}
          >
            <Text className="text-[17px]" style={{ fontFamily: "Poppins_600SemiBold", color: stableColors.textInverse }}>
              Sort By
            </Text>
            <TouchableOpacity
              onPress={() => sheetRef.current?.dismiss()}
              className="w-8 h-8 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              <X size={18} color={stableColors.textInverse} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <View
            className="px-4 pt-1"
            style={{ paddingBottom: (insets.bottom || 16) + 8 }}
          >
            {SORT_OPTIONS.map((opt, i) => {
              const isActive = selected === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => handleSelect(opt.id)}
                  activeOpacity={0.65}
                  className="flex-row items-center justify-between py-3.5 px-1"
                  style={{
                    borderBottomWidth: i < SORT_OPTIONS.length - 1 ? 1 : 0,
                    borderBottomColor: stableColors.border,
                  }}
                >
                  {/* Radio + Label */}
                  <View className="flex-row items-center gap-3">
                    {/* Radio */}
                    <View
                      className="w-5 h-5 rounded-full border-2 items-center justify-center"
                      style={{
                        borderColor:     isActive ? stableColors.primary : stableColors.border,
                        backgroundColor: isActive ? stableColors.primary : "transparent",
                      }}
                    >
                      {isActive && (
                        <View className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </View>

                    <Text
                      style={{
                        fontSize:   14,
                        fontFamily: isActive ? "Poppins_600SemiBold" : "Poppins_400Regular",
                        color:      isActive ? stableColors.primary : stableColors.text,
                      }}
                    >
                      {opt.label}
                    </Text>
                  </View>

                  {/* Check */}
                  {isActive && (
                    <Check size={16} color={stableColors.primary} strokeWidth={2.5} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

SortBottomSheet.displayName = "SortBottomSheet";
export default SortBottomSheet;