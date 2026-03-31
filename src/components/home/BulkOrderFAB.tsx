// src/components/home/BulkOrderFAB.tsx
import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { SharedValue } from "react-native-reanimated";
import { useTheme } from "../../theme";

type Props = {
  scrollVisible: SharedValue<number>; // same value as search — 1=show, 0=hide
  onPress?: () => void;
};

const BulkOrderFAB: React.FC<Props> = ({ scrollVisible, onPress }) => {
  const { colors } = useTheme();

  // Text width animate — 0 to ~80
  const textAnimStyle = useAnimatedStyle(() => ({
    width: interpolate(
      scrollVisible.value,
      [0, 1],
      [0, 82],
      Extrapolate.CLAMP
    ),
    opacity: interpolate(
      scrollVisible.value,
      [0, 0.4, 1],
      [0, 0, 1],
      Extrapolate.CLAMP
    ),
    overflow: "hidden",
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        position: "absolute",
        right: 0,
        top: "35%",
        zIndex: 100,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.primary,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        paddingVertical: 10,
        paddingLeft: 10,
        paddingRight: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: -3, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      {/* Animated Text */}
      <Animated.View style={textAnimStyle}>
         <ChevronLeft size={16} color="#fff" strokeWidth={2.5} />
        <Text
          numberOfLines={1}
          style={{
            color: "#fff",
            fontSize: 12,
            fontFamily: "Poppins_600SemiBold",
            letterSpacing: 0.3,
          }}
        >
          Bulk Order
        </Text>
      </Animated.View>

      {/* Icon — always visible */}
     
    </TouchableOpacity>
  );
};

export default BulkOrderFAB;