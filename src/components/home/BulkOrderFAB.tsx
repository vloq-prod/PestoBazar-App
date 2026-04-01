import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { ChevronLeft, ShoppingBag } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SharedValue } from "react-native-reanimated";
import { useTheme } from "../../theme";

type Props = {
  scrollVisible: SharedValue<number>;
  onPress?: () => void;
};

const BulkOrderFAB: React.FC<Props> = ({ scrollVisible, onPress }) => {
  const { colors } = useTheme();

  // ── manualOpen: click pe expand, stay expanded jab tak user scroll na kare
  const manualOpen = useSharedValue(0);

  const expandStyle = useAnimatedStyle(() => {
    // scroll pe top jaane pe manualOpen reset
    if (scrollVisible.value === 1) manualOpen.value = 0;

    const value = Math.max(scrollVisible.value, manualOpen.value);
    return {
      width: interpolate(value, [0, 1], [0, 115], Extrapolate.CLAMP),
      opacity: interpolate(value, [0, 0.35, 1], [0, 0, 1], Extrapolate.CLAMP),
    };
  });

  const chevronStyle = useAnimatedStyle(() => {
    const value = Math.max(scrollVisible.value, manualOpen.value);
    return {
      transform: [
        {
          rotate: `${interpolate(
            value,
            [0, 1],
            [0, 180],
            Extrapolate.CLAMP,
          )}deg`,
        },
      ],
    };
  });

  const handlePress = () => {
    // ✅ toggle — expand/collapse manually, NO auto-hide
    if (manualOpen.value === 1) {
      manualOpen.value = withSpring(0, { damping: 18, stiffness: 200 });
    } else {
      manualOpen.value = withSpring(1, { damping: 16, stiffness: 180 });
    }
    onPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.88}
      style={{
        // ✅ bottom fixed — scroll pe nahi hilega
        position: "absolute",
        right: 0,
        bottom: 110,
        zIndex: 50,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 14,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        paddingVertical: 12,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: colors.primary,
        shadowColor: "#000",
        shadowOffset: { width: -3, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      {/* ── Expandable content ── */}
      <Animated.View
        style={[
          expandStyle,
          {
            overflow: "hidden",
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          },
        ]}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: "rgba(255,255,255,0.18)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ShoppingBag size={16} color="#fff" strokeWidth={2} />
        </View>

        <Text
          numberOfLines={1}
          style={{
            fontSize: 13,
            fontFamily: "Poppins_600SemiBold",
            color: "#fff",
            lineHeight: 18,
          }}
        >
          Bulk Order
        </Text>
      </Animated.View>

      {/* ── Chevron ── */}
      <Animated.View style={chevronStyle}>
        <ChevronLeft size={20} color="#fff" strokeWidth={2.5} />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default BulkOrderFAB;
