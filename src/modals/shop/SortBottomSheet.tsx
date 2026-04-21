import React, {
  useImperativeHandle,
  useState,
  useCallback,
  forwardRef,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { X, Check } from "lucide-react-native";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
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
  { id: 1, label: "Popularity" },
  { id: 2, label: "Name A to Z" },
  { id: 3, label: "Name Z to A" },
  { id: 4, label: "Price Low to High" },
  { id: 5, label: "Price High to Low" },
  { id: 6, label: "Top Rated" },
];

const SortBottomSheet = forwardRef<SortBottomSheetRef, Props>(
  ({ selected = 1, onSelect }, ref) => {
    const { colors } = useTheme();
    const { font, spacing } = useResponsive();
    const insets = useSafeAreaInsets();
    const [visible, setVisible] = useState(false);

    useImperativeHandle(ref, () => ({
      open: () => setVisible(true),
      close: () => setVisible(false),
    }));

    const handleSelect = useCallback(
      (id: number) => {
        onSelect(id);
        setVisible(false);
      },
      [onSelect],
    );

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
          {/* Outside click close */}
          <Pressable style={{ flex: 1 }} onPress={() => setVisible(false)} />

          {/* Bottom Sheet */}
          <View
            style={{
              height: "50%",
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              overflow: "visible",
            }}
          >
            {/* 🔥 Floating Cross */}
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

            {/* Header */}
            <View
              style={{
                paddingHorizontal: spacing(16),
                paddingVertical: spacing(14),
                borderBottomWidth: 0.5,
                borderBottomColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: font(15),
                  fontFamily: "Poppins_600SemiBold",
                  color: colors.text,
                }}
              >
                Sort By
              </Text>
            </View>

            {/* Options */}
            <View
              style={{
                paddingHorizontal: spacing(16),
                paddingBottom: Math.max(insets.bottom, spacing(16)),
              }}
            >
              {SORT_OPTIONS.map((opt, i) => {
                const isActive = selected === opt.id;

                return (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => handleSelect(opt.id)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingVertical: spacing(14),
                      borderBottomWidth:
                        i < SORT_OPTIONS.length - 1 ? 0.5 : 0,
                      borderBottomColor: colors.border,
                    }}
                  >
                    {/* Left */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: spacing(10),
                      }}
                    >
                      {/* Radio */}
                      <View
                        style={{
                          width: spacing(18),
                          height: spacing(18),
                          borderRadius: spacing(9),
                          borderWidth: 1.5,
                          borderColor: isActive
                            ? colors.primary
                            : colors.border,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: isActive
                            ? colors.primary
                            : "transparent",
                        }}
                      >
                        {isActive && (
                          <View
                            style={{
                              width: spacing(6),
                              height: spacing(6),
                              borderRadius: spacing(3),
                              backgroundColor: "#fff",
                            }}
                          />
                        )}
                      </View>

                      <Text
                        style={{
                          fontSize: font(13),
                          fontFamily: isActive
                            ? "Poppins_600SemiBold"
                            : "Poppins_400Regular",
                          color: isActive
                            ? colors.primary
                            : colors.text,
                        }}
                      >
                        {opt.label}
                      </Text>
                    </View>

                    {/* Check */}
                    {isActive && (
                      <Check
                        size={spacing(16)}
                        color={colors.primary}
                        strokeWidth={2.5}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    );
  },
);

SortBottomSheet.displayName = "SortBottomSheet";
export default SortBottomSheet;