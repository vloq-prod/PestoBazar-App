// src/components/comman/WishlistButton.tsx

import React, { useRef } from "react";
import {
  TouchableOpacity,
  Animated,
  StyleProp,
  ViewStyle,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import { Heart } from "lucide-react-native";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { useIsWishlisted, useToggleWishlist } from "../../hooks/wishlistHooks";

interface WishlistButtonProps {
  productId: number | undefined;
  size?: number;
  containerSize?: number;
  style?: StyleProp<ViewStyle>;
  onToggle?: (isWishlisted: boolean) => void;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  size,
  containerSize,
  style,
  onToggle,
}) => {
  const { colors } = useTheme();
  const { spacing } = useResponsive();
  const isWishlisted = useIsWishlisted(productId);
  const { toggleWishlist, isPending } = useToggleWishlist();

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const iconSize = size ?? spacing(18);

  const handlePress = (e: GestureResponderEvent) => {
    e.stopPropagation();
    if (!productId || isPending) return;

    // Micro-bounce spring animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.75,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.25,
        friction: 3,
        tension: 45,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();

    toggleWishlist(productId);
    onToggle?.(!isWishlisted);
  };

  const activeColor = "#EF4444"; // Vibrant Rose Red
  const inactiveColor = colors.textSecondary || "#64748B";

  return (
    <TouchableOpacity
      activeOpacity={0.65}
      onPress={handlePress}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      style={[
        styles.container,
        containerSize ? { width: containerSize, height: containerSize } : null,
        style,
      ]}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Heart
          size={iconSize}
          color={isWishlisted ? activeColor : inactiveColor}
          fill={isWishlisted ? activeColor : "transparent"}
          strokeWidth={isWishlisted ? 2.2 : 1.8}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default React.memo(WishlistButton);

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    zIndex: 10,
  },
});
