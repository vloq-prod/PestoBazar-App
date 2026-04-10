import React from "react";
import {
  TouchableOpacity,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  ChevronLeft,
  ChevronRight,
  MoveRight,
} from "lucide-react-native";
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
      width: interpolate(progress, [0, 1], [0, 80], Extrapolate.CLAMP),
      opacity: interpolate(
        progress,
        [0, 0.35, 1],
        [0, 0, 1],
        Extrapolate.CLAMP,
      ),
      overflow: "hidden",
    };
  });

  const collapsedHandleStyle = useAnimatedStyle(() => {
    const progress = manualOpen.value;

    return {
      width: interpolate(progress, [0, 1], [20, 0], Extrapolate.CLAMP),
      opacity: interpolate(progress, [0, 0.35, 1], [1, 0, 0], Extrapolate.CLAMP),
      overflow: "hidden",
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
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,

        paddingVertical: 2,
        paddingLeft: 2,

        backgroundColor: colors.background,
      }}
    >
      {/* when visible show only this show */}
      <Animated.View style={[{ position: "relative" }, expandStyle]}>
        <Image
          source={image1}
          style={{
            width: 80,
            height: 40,
            borderRadius: 8,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          }}
          contentFit="cover"
        />

        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.55)",
            borderRadius: 8,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          }}
        />

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
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <View>
              <Text
                style={{
                  fontSize: 14,
                  color: "#fff",
                  fontWeight: "700",
                  lineHeight: 20,
                  fontFamily: "Poppins_500Medium",
                }}
              >
                Bulk
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#fff",
                  fontWeight: "700",
                  lineHeight: 15,
                  fontFamily: "Poppins_500Medium",
                }}
              >
                Orders
              </Text>
            </View>

            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <ChevronRight size={22} color={colors.background} />
            </View>
          </View>
        </View>
      </Animated.View>

      {/* When visible hide this is show  only */}
      <Animated.View
        style={{
          height: 40,
          justifyContent: "center",
          padding: 0.5,
        }}
      >
        <Animated.View
          style={collapsedHandleStyle}
        >
          <View
          style={{
            width: 20,
            height: 40,
            justifyContent: "center",
            backgroundColor: "#000000",
            borderTopLeftRadius: 5,
            borderBottomLeftRadius: 5,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            overflow: "hidden",
          }}
        >
          <Animated.View>
            <ChevronLeft size={20} color="#fff" strokeWidth={2.5} />
          </Animated.View>
          </View>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default BulkOrderFAB;
