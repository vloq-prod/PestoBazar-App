import React from "react";
import { TouchableOpacity, Text, View, useWindowDimensions } from "react-native";
import { ChevronLeft, ShoppingBag } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useAnimatedReaction,
  interpolate,
  Extrapolate,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { useTheme } from "../../theme";

type Props = {
  onPress?: () => void;
  visible?: SharedValue<number>;
};

const BulkOrderFAB: React.FC<Props> = ({ onPress, visible }) => {
  const { colors } = useTheme();
  const { height } = useWindowDimensions();
  const manualOpen = useSharedValue(1);
  const bottomOffset = Math.max(120, Math.min(height * 0.22, 200));

  useAnimatedReaction(
    () => visible?.value ?? 1,
    (current, previous) => {
      if (current === previous) return;
      manualOpen.value = withTiming(current > 0.5 ? 1 : 0, { duration: 280 });
    },
    [visible],
  );

  const expandStyle = useAnimatedStyle(() => {
    const progress = manualOpen.value;

    return {
      width: interpolate(progress, [0, 1], [0, 75], Extrapolate.CLAMP),
      opacity: interpolate(
        progress,
        [0, 0.35, 1],
        [0, 0, 1],
        Extrapolate.CLAMP,
      ),
    };
  });

  const chevronStyle = useAnimatedStyle(() => {
    const progress = manualOpen.value;

    return {
      transform: [
        {
          rotate: `${interpolate(
            progress,
            [0, 1],
            [0, 180],
            Extrapolate.CLAMP,
          )}deg`,
        },
      ],
    };
  });

  const handlePress = () => {
    const nextValue = manualOpen.value > 0.5 ? 0 : 1;
    manualOpen.value = withTiming(nextValue, { duration: 280 });
    onPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={9}
      style={{
        position: "absolute",
        right: 0,
        bottom: bottomOffset,
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
            height: 30,
          },
        ]}
      >
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

      <Animated.View style={chevronStyle}>
        <ChevronLeft size={20} color="#fff" strokeWidth={2.5} />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default BulkOrderFAB;
