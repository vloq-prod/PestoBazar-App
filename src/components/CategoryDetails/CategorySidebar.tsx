// src/components/category/CategorySidebar.tsx
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "../../theme";
import { CategoryItem } from "../../types/home.types";
import { useResponsive } from "../../utils/useResponsive";
import image1 from "../../../assets/category/category4.png";

const ITEM_HEIGHT = 100;
const ANIM_DURATION = 220;
const EASING = Easing.out(Easing.quad);

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
  <View style={{ paddingHorizontal: 6, paddingTop: 10, gap: 10 }}>
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
  onPress: () => void;
  primaryColor: string;
  textSecondaryColor: string;
};

const CategorySidebarItem = ({
  item,
  isActive,
  onPress,
  primaryColor,
  textSecondaryColor,
}: SidebarItemProps) => {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();
  const imageSource =
    item.category_name?.trim().toLowerCase() === "all"
      ? image1
      : { uri: item.s3_image_path };

  const bgOpacity = useSharedValue(isActive ? 1 : 0);
  const scale = useSharedValue(isActive ? 1 : 0.94);

  useEffect(() => {
    bgOpacity.value = withTiming(isActive ? 1 : 0, {
      duration: ANIM_DURATION,
      easing: EASING,
    });
    scale.value = withTiming(isActive ? 1 : 0.94, {
      duration: ANIM_DURATION,
      easing: EASING,
    });
  }, [bgOpacity, isActive, scale]);

  const wrapperStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.itemOuter,
        {
          flexDirection: "row",
          marginBottom: spacing(4),
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
          },
        ]}
      >
        {(item.category_name?.trim().toLowerCase() === "all" ||
          !!item.s3_image_path) && (
          <View style={styles.avatarWrap}>
            <Image
              source={imageSource}
              style={styles.avatar}
              contentFit="cover"
            />
          </View>
        )}

        <Text
          numberOfLines={2}
          style={[
            styles.label,
            {
              color: isActive ? primaryColor : textSecondaryColor,
              fontSize: font(10.5),
              lineHeight: font(15),
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

      {isActive && (
        <View
          style={{
            padding: 2,
            backgroundColor: colors.primary,
            borderTopLeftRadius: 6,
            borderBottomLeftRadius: 6,
          }}
        />
      )}
    </TouchableOpacity>
  );
};

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
  const listRef = useRef<FlatList<CategoryItem>>(null);
  const itemSpacing = spacing(4);
  const itemTotalHeight = ITEM_HEIGHT + itemSpacing;
  const listTopPadding = spacing(10);

  // ── Auto-scroll to active item when selectedSlug changes ──────────────────
  // Small delay so the list has rendered before we scroll
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!selectedSlug || categories.length === 0) return;

    const index = categories.findIndex(
      (item) => item.slug?.toString() === selectedSlug,
    );
    if (index < 0) return;

    // Clear any pending scroll from a previous effect
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

    scrollTimeoutRef.current = setTimeout(() => {
      listRef.current?.scrollToIndex({
        index,
        animated: true,
        // 0.5 = center the active item vertically in the visible area
        viewPosition: 0.5,
      });
    }, 80); // 80 ms is enough for RN to finish its layout pass

    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [selectedSlug, categories]);

  // ── Fallback: if scrollToIndex fires before item is measured ─────────────
  const handleScrollToIndexFailed = ({
    index,
    averageItemLength,
  }: {
    index: number;
    averageItemLength: number;
  }) => {
    // Scroll to approximate offset first, then retry after layout
    const offset = listTopPadding + averageItemLength * index;
    listRef.current?.scrollToOffset({ offset, animated: false });

    setTimeout(() => {
      listRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }, 120);
  };

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.surface,
          shadowColor: "#000",
          shadowOffset: { width: 2, height: 0 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        },
      ]}
    >
      {loading ? (
        <SidebarSkeleton />
      ) : (
        <FlatList
          ref={listRef}
          data={categories}
          keyExtractor={(item) => item.slug.toString()}
          renderItem={({ item }) => (
            <CategorySidebarItem
              item={item}
              isActive={selectedSlug === item.slug?.toString()}
              onPress={() => onSelect(item)}
              primaryColor={colors.primary}
              textSecondaryColor={colors.textSecondary}
            />
          )}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
          getItemLayout={(_, index) => ({
            length: itemTotalHeight,
            offset: listTopPadding + itemTotalHeight * index,
            index,
          })}
          onScrollToIndexFailed={handleScrollToIndexFailed}
          contentContainerStyle={styles.listContent}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      )}
    </View>
  );
};

export default CategorySidebar;

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    width: "22%",
  },
  listContent: {},
  itemOuter: {
    height: ITEM_HEIGHT,
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
  },
  avatar: { width: "100%", height: "100%" },
  label: {
    textAlign: "center",
  },
});
