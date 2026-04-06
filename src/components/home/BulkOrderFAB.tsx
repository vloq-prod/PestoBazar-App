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
import { useTheme } from "../../theme";

type Props = {
  onPress?: () => void;
};

const BulkOrderFAB: React.FC<Props> = ({ onPress }) => {
  const { colors } = useTheme();

  const manualOpen = useSharedValue(0);

  const expandStyle = useAnimatedStyle(() => {
    return {
      width: interpolate(manualOpen.value, [0, 1], [0, 75], Extrapolate.CLAMP),
      opacity: interpolate(
        manualOpen.value,
        [0, 0.35, 1],
        [0, 0, 1],
        Extrapolate.CLAMP,
      ),
    };
  });

  const chevronStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${interpolate(
            manualOpen.value,
            [0, 1],
            [0, 180],
            Extrapolate.CLAMP,
          )}deg`,
        },
      ],
    };
  });

  const handlePress = () => {
    if (manualOpen.value === 1) {
      manualOpen.value = withSpring(0, { stiffness: 300 });
    } else {
      manualOpen.value = withSpring(1, { stiffness: 300 });
    }
    onPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={9}
      style={{
        position: "absolute",
        right: 0,
        bottom: 11,
        zIndex: 50,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 14,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        paddingVertical: 8,
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
      <Animated.View
        style={[
          expandStyle,
          {
            overflow: "hidden",
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            width: 20,
            height: 30,
          },
        ]}
      >
        {/* Icon */}
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            backgroundColor: "rgba(255,255,255,0.18)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ShoppingBag size={15} color="#fff" strokeWidth={2} />
        </View>

        {/* Text */}
        <View>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Poppins_600SemiBold",
              color: "#fff",
              lineHeight: 12,
              includeFontPadding: false,
            }}
          >
            Bulk
          </Text>

          <Text
            style={{
              fontSize: 12,
              fontFamily: "Poppins_600SemiBold",
              color: "#fff",
              lineHeight: 14,

              includeFontPadding: false,
            }}
          >
            Order
          </Text>
        </View>
      </Animated.View>

      {/* ── Chevron ── */}
      <Animated.View style={chevronStyle}>
        <ChevronLeft size={20} color="#fff" strokeWidth={2.5} />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default BulkOrderFAB;
