// src/components/comman/SidebarCategoryItem.tsx
import React, { useEffect, useCallback } from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { CategoryItem, AppMenuCategoryItem } from "../../types/home.types";

type SidebarItemType = CategoryItem | AppMenuCategoryItem;

type Props = {
  item: SidebarItemType;
  isActive: boolean;
  onPress: (item: any) => void;
  colors: any;
};

const SidebarCategoryItem: React.FC<Props> = React.memo(
  ({ item, isActive, onPress, colors }) => {
    const normalImg =
      item.category_image ||
      item.s3_image_path ||
      ("s3_image_url" in item ? item.s3_image_url : null) ||
      "";
    const flipImg = ("flip_image" in item && item.flip_image) || normalImg;

    const activeColor = colors?.primary || "#00875A";

    const flipProgress = useSharedValue(isActive ? 1 : 0);
    const activeGlow = useSharedValue(isActive ? 1 : 0);

    useEffect(() => {
      flipProgress.value = withSpring(isActive ? 1 : 0, {
        damping: 14,
        stiffness: 110,
        mass: 0.75,
      });
      activeGlow.value = withSpring(isActive ? 1 : 0, {
        damping: 16,
        stiffness: 120,
      });
    }, [isActive, flipProgress, activeGlow]);

    const frontStyle = useAnimatedStyle(() => {
      const rotateYVal = interpolate(
        flipProgress.value,
        [0, 1],
        [0, 180],
        Extrapolation.CLAMP,
      );
      const rotateZVal = interpolate(
        flipProgress.value,
        [0, 0.5, 1],
        [0, -10, 0],
        Extrapolation.CLAMP,
      );

      return {
        transform: [
          { perspective: 1000 },
          { rotateY: `${rotateYVal}deg` },
          { rotateZ: `${rotateZVal}deg` },
        ],
        backfaceVisibility: "hidden",
        opacity: flipProgress.value < 0.5 ? 1 : 0,
        zIndex: flipProgress.value < 0.5 ? 2 : 1,
      };
    });

    const backStyle = useAnimatedStyle(() => {
      const rotateYVal = interpolate(
        flipProgress.value,
        [0, 1],
        [180, 360],
        Extrapolation.CLAMP,
      );
      const rotateZVal = interpolate(
        flipProgress.value,
        [0, 0.5, 1],
        [0, 10, 0],
        Extrapolation.CLAMP,
      );

      return {
        transform: [
          { perspective: 1000 },
          { rotateY: `${rotateYVal}deg` },
          { rotateZ: `${rotateZVal}deg` },
        ],
        backfaceVisibility: "hidden",
        opacity: flipProgress.value >= 0.5 ? 1 : 0,
        zIndex: flipProgress.value >= 0.5 ? 2 : 1,
      };
    });

    const avatarPopStyle = useAnimatedStyle(() => {
      const scaleVal = interpolate(
        flipProgress.value,
        [0, 0.5, 1],
        [1, 1.22, 1.06],
        Extrapolation.CLAMP,
      );
      const translateYVal = interpolate(
        flipProgress.value,
        [0, 0.5, 1],
        [0, -3, 0],
        Extrapolation.CLAMP,
      );

      return {
        transform: [{ scale: scaleVal }, { translateY: translateYVal }],
      };
    });

    const indicatorStyle = useAnimatedStyle(() => {
      const scaleY = interpolate(activeGlow.value, [0, 1], [0, 1]);
      const opacity = interpolate(activeGlow.value, [0, 1], [0, 1]);
      return {
        transform: [{ scaleY }],
        opacity,
      };
    });

    const handlePress = useCallback(() => {
      onPress(item);
    }, [onPress, item]);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        style={{
          paddingVertical: 8,
          paddingHorizontal: 4,
          alignItems: "center",
          position: "relative",
        }}
      >
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          {/* 3D Circle Image Wrapper */}
          <Animated.View
            style={[
              {
                width: 46,
                height: 46,
                borderRadius: 23,
                backgroundColor: "transparent",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              },
              avatarPopStyle,
            ]}
          >
            {normalImg ? (
              <>
                {/* Front face */}
                <Animated.View
                  style={[
                    StyleSheet.absoluteFill,
                    { alignItems: "center", justifyContent: "center" },
                    frontStyle,
                  ]}
                >
                  <Image
                    source={{ uri: normalImg }}
                    style={{ width: 34, height: 34 }}
                    contentFit="contain"
                  />
                </Animated.View>

                {/* Back face */}
                <Animated.View
                  style={[
                    StyleSheet.absoluteFill,
                    { alignItems: "center", justifyContent: "center" },
                    backStyle,
                  ]}
                >
                  <Image
                    source={{ uri: flipImg! }}
                    style={{ width: 34, height: 34 }}
                    contentFit="contain"
                  />
                </Animated.View>
              </>
            ) : (
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Poppins_600SemiBold",
                  color: isActive ? activeColor : "#757575",
                }}
              >
                {item.category_name?.[0]?.toUpperCase() ?? "?"}
              </Text>
            )}
          </Animated.View>
        </View>

        {/* Category Title */}
        <Text
          numberOfLines={2}
          style={{
            marginTop: 6,
            fontSize: 9.5,
            fontFamily: isActive ? "Poppins_700Bold" : "Poppins_500Medium",
            color: isActive ? activeColor : "#666666",
            textAlign: "center",
            lineHeight: 12,
            width: "100%",
          }}
        >
          {item.category_name}
        </Text>

        {/* Right Active Indicator Bar */}
        <Animated.View
          style={[
            {
              position: "absolute",
              right: 0,
              top: 6,
              bottom: 6,
              width: 3.5,
              borderTopLeftRadius: 3,
              borderBottomLeftRadius: 3,
              backgroundColor: activeColor,
            },
            indicatorStyle,
          ]}
        />
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) =>
    prevProps.isActive === nextProps.isActive &&
    prevProps.item.id === nextProps.item.id &&
    prevProps.colors?.primary === nextProps.colors?.primary,
);

export default SidebarCategoryItem;
