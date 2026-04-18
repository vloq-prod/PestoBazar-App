import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { Truck, BadgeCheck, Headphones, RotateCcw } from "lucide-react-native";
import { useResponsive } from "../../utils/useResponsive";
import { useTheme } from "../../theme";

const SERVICES = [
  {
    title: "All India Delivery",
    description: "For any order value",
    Icon: Truck,
  },
  {
    title: "Genuine Products",
    description: "100% authenticity guarantee",
    Icon: BadgeCheck,
  },
  {
    title: "Online Support",
    description: "9AM – 6PM, Mon to Sat",
    Icon: Headphones,
  },
  {
    title: "Easy Returns",
    description: "Hassle-free returns",
    Icon: RotateCcw,
  },
];

const ServiceItem = ({ item }: any) => {
  const { spacing, font } = useResponsive();
  const { colors } = useTheme();
  const Icon = item.Icon;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginRight: spacing(30),
      }}
    >
      <Icon size={spacing(25)} color={colors.primary} />

      <View style={{ marginLeft: spacing(10) }}>
        <Text
          style={{
            fontSize: font(13),
            color: colors.text,
            fontFamily: "Poppins_600SemiBold",
          }}
        >
          {item.title}
        </Text>

        <Text
          style={{
            fontSize: font(11),
            color: colors.textSecondary,
            marginTop: 2,
          }}
        >
          {item.description}
        </Text>
      </View>
    </View>
  );
};
const OurServices = () => {
  const translateX = useSharedValue(0);
  const [setWidth, setSetWidth] = useState(0);

  useEffect(() => {
    if (setWidth === 0) return;

    translateX.value = 0;
    translateX.value = withRepeat(
      withTiming(-setWidth, {
        duration: setWidth * 18, // speed tune karo yahan se
        easing: Easing.linear,
      }),
      -1, // infinite
      false, // reverse nahi
    );
  }, [setWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={{ overflow: "hidden" }}>
      <Animated.View style={[{ flexDirection: "row" }, animatedStyle]}>
        {/* First set — onLayout se width milegi */}
        <View
          style={{ flexDirection: "row" }}
          onLayout={(e) => setSetWidth(e.nativeEvent.layout.width)}
        >
          {SERVICES.map((item, i) => (
            <ServiceItem key={`a-${i}`} item={item} />
          ))}
        </View>

        {/* Duplicate — seamless loop ke liye */}
        {SERVICES.map((item, i) => (
          <ServiceItem key={`b-${i}`} item={item} />
        ))}
      </Animated.View>
    </View>
  );
};
export default OurServices;
