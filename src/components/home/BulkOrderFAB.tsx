import React from "react";
import {
  TouchableOpacity,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { ChevronLeft, MoveRight, ShoppingBag } from "lucide-react-native";
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

import image1 from "../../../assets/image.png";
import { Image } from "expo-image";

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
        borderRadius: 8,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,

        paddingVertical: 2,
        paddingLeft: 2,

        backgroundColor: colors.background,
      }}
    >
      <View style={{ position: "relative" }}>
        {/* Background Image */}
        <Image
          source={image1}
          style={{
            width: 75,
            height: 32,
            borderRadius: 8,
          }}
          contentFit="cover"
        />

        {/* 🔥 Dark Overlay */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.55)", // 👈 increase/decrease this
            borderRadius: 8,
          }}
        />

        {/* Overlay Content */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,

            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 6,
          }}
        >
          <View
            style={{ flexDirection: "row", alignItems: "flex-end", gap: 1 }}
          >
            <View>
              <Text
                style={{
                  fontSize: 11,
                  color: "#fff",
                  fontWeight: "700",
                  lineHeight: 14,
                  fontFamily: "Poppins_500Medium",
                }}
              >
                Bulk
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: "#fff",
                  fontWeight: "700",
                  lineHeight: 13,
                  fontFamily: "Poppins_500Medium",
                }}
              >
                Orders
              </Text>
            </View>

            <Animated.View style={{ transform: [{ rotate: "-40deg" }] }}>
              <MoveRight size={22} color={colors.background} />
            </Animated.View>
          </View>
        </View>
      </View>

      {/* <Animated.View style={chevronStyle}>
        <ChevronLeft size={20} color="#fff" strokeWidth={2.5} />
      </Animated.View> */}
    </TouchableOpacity>
  );
};

export default BulkOrderFAB;
