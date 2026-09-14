// src/components/category/CategorySidebar.tsx
import React, { useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { useTheme } from "../../theme";
import { CategoryItem } from "../../types/home.types";
import { useResponsive } from "../../utils/useResponsive";
import { LayoutGrid } from "lucide-react-native";

const ITEM_HEIGHT = 100;
const ITEM_GAP = 20;

const SkeletonBox = ({
  width,
  height,
  borderRadius = 8,
}: {
  width: number;
  height: number;
  borderRadius?: number;
}) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: colors.backgroundSkeleton,
      }}
    />
  );
};

const SidebarSkeleton = () => (
  <View style={{ paddingHorizontal: 6, paddingTop: 10, gap: ITEM_GAP }}>
    {Array.from({ length: 7 }).map((_, i) => (
      <View
        key={i}
        style={{
          height: ITEM_HEIGHT,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <SkeletonBox width={46} height={46} borderRadius={23} />
        <SkeletonBox width={38} height={9} borderRadius={5} />
        <SkeletonBox width={28} height={7} borderRadius={5} />
      </View>
    ))}
  </View>
);

type SidebarItemProps = {
  item: CategoryItem;
  isActive: boolean;
  onPress: (item: CategoryItem) => void;
  primaryColor: string;
  textSecondaryColor: string;
};

const CategorySidebarItem = React.memo(
  ({
    item,
    isActive,
    onPress,
    primaryColor,
    textSecondaryColor,
  }: SidebarItemProps) => {
    const { spacing, font } = useResponsive();

    const normalImage = item.category_image || item.s3_image_path || "";
    const flipImage = item.flip_image;
    const hasFlipImage = !!flipImage;

    const flipProgress = useSharedValue(isActive && hasFlipImage ? 1 : 0);
    const activeGlow = useSharedValue(isActive ? 1 : 0);

    useEffect(() => {
      flipProgress.value = withSpring(isActive && hasFlipImage ? 1 : 0, {
        damping: 14,
        stiffness: 110,
        mass: 0.75,
      });
      activeGlow.value = withSpring(isActive ? 1 : 0, {
        damping: 16,
        stiffness: 120,
      });
    }, [isActive, hasFlipImage, flipProgress, activeGlow]);

    const wrapperStyle = useAnimatedStyle(() => ({
      transform: [
        {
          scale: interpolate(
            activeGlow.value,
            [0, 1],
            [0.94, 1.02],
            Extrapolation.CLAMP,
          ),
        },
      ],
    }));

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
          { perspective: 1200 },
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
          { perspective: 1200 },
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
        activeGlow.value,
        [0, 1],
        [1, 1.08],
        Extrapolation.CLAMP,
      );

      return {
        transform: [{ scale: scaleVal }],
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
        style={[
          styles.itemOuter,
          {
            flexDirection: "row",
            alignItems: "center",
            position: "relative",
            width: "100%",
          },
        ]}
      >
        <Animated.View
          style={[
            styles.itemInner,
            wrapperStyle,
            {
              borderRadius: spacing(14),
              paddingHorizontal: spacing(4),
              backgroundColor: "transparent",
            },
          ]}
        >
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Animated.View
              style={[
                styles.avatarWrap,
                avatarPopStyle,
                {
                  backgroundColor: "transparent",
                  position: "relative",
                },
              ]}
            >
              {hasFlipImage ? (
                <>
                  <Animated.View
                    style={[
                      StyleSheet.absoluteFill,
                      { alignItems: "center", justifyContent: "center" },
                      frontStyle,
                    ]}
                  >
                    <Image
                      source={{ uri: normalImage }}
                      style={styles.avatar}
                      contentFit="cover"
                    />
                  </Animated.View>

                  <Animated.View
                    style={[
                      StyleSheet.absoluteFill,
                      { alignItems: "center", justifyContent: "center" },
                      backStyle,
                    ]}
                  >
                    <Image
                      source={{ uri: flipImage! }}
                      style={styles.avatar}
                      contentFit="cover"
                    />
                  </Animated.View>
                </>
              ) : normalImage ? (
                <Image
                  source={{ uri: normalImage }}
                  style={styles.avatar}
                  contentFit="cover"
                />
              ) : (
                <LayoutGrid
                  size={22}
                  color={isActive ? primaryColor : textSecondaryColor}
                />
              )}
            </Animated.View>
          </View>

          <Text
            numberOfLines={2}
            style={[
              styles.label,
              {
                color: isActive ? primaryColor : textSecondaryColor,
                fontSize: font(9),
                paddingHorizontal: spacing(2),
                fontFamily: isActive
                  ? "Poppins_600SemiBold"
                  : "Poppins_500Medium",
              },
            ]}
          >
            {item.category_name}
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            {
              position: "absolute",
              right: 0,
              top: 4,
              bottom: 4,
              width: 4,
              backgroundColor: primaryColor,
              borderTopLeftRadius: 4,
              borderBottomLeftRadius: 4,
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
    prevProps.item.category_image === nextProps.item.category_image &&
    prevProps.item.flip_image === nextProps.item.flip_image &&
    prevProps.primaryColor === nextProps.primaryColor &&
    prevProps.textSecondaryColor === nextProps.textSecondaryColor,
);

export type CategorySidebarProps = {
  categories: CategoryItem[];
  loading: boolean;
  selectedSlug: string | null;
  onSelect: (item: CategoryItem) => void;
};

const CategorySidebar = ({
  categories,
  loading,
  selectedSlug,
  onSelect,
}: CategorySidebarProps) => {
  const { colors } = useTheme();
  const { spacing } = useResponsive();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<CategoryItem>>(null);
  const itemTotalHeight = ITEM_HEIGHT + ITEM_GAP;
  const listTopPadding = spacing(10);

  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!selectedSlug || categories.length === 0) return;

    const index = categories.findIndex(
      (item) => item.slug?.toString() === selectedSlug,
    );
    if (index < 0) return;

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

    scrollTimeoutRef.current = setTimeout(() => {
      listRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }, 80);

    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [selectedSlug, categories]);

  const handleScrollToIndexFailed = useCallback(
    ({
      index,
      averageItemLength,
    }: {
      index: number;
      averageItemLength: number;
    }) => {
      const offset = listTopPadding + averageItemLength * index;
      listRef.current?.scrollToOffset({ offset, animated: false });

      setTimeout(() => {
        listRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      }, 120);
    },
    [listTopPadding],
  );

  const keyExtractor = useCallback(
    (item: CategoryItem) => item.id?.toString() ?? item.slug?.toString(),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: CategoryItem }) => (
      <CategorySidebarItem
        item={item}
        isActive={selectedSlug === item.slug?.toString()}
        onPress={onSelect}
        primaryColor={colors.primary}
        textSecondaryColor={colors.textSecondary}
      />
    ),
    [selectedSlug, onSelect, colors.primary, colors.textSecondary],
  );

  const separator = useCallback(
    () => <View style={{ height: ITEM_GAP }} />,
    [],
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: itemTotalHeight,
      offset: listTopPadding + itemTotalHeight * index,
      index,
    }),
    [itemTotalHeight, listTopPadding],
  );

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.surface,
          borderRightWidth: 1,
          borderRightColor: colors.border,
        },
      ]}
    >
      {loading ? (
        <SidebarSkeleton />
      ) : (
        <FlatList
          ref={listRef}
          data={categories}
          keyExtractor={keyExtractor}
          contentContainerStyle={{
            paddingBottom: insets.bottom + spacing(80),
          }}
          renderItem={renderItem}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          getItemLayout={getItemLayout}
          onScrollToIndexFailed={handleScrollToIndexFailed}
          ItemSeparatorComponent={separator}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
        />
      )}
    </View>
  );
};

export default CategorySidebar;

const styles = StyleSheet.create({
  root: {
    width: "19%",
  },
  itemOuter: {
    alignSelf: "flex-start",
  },
  itemInner: {
    flex: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: { width: "100%", height: "100%" },
  label: {
    textAlign: "center",
  },
});
