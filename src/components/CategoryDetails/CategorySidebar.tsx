// src/components/category/CategorySidebar.tsx
import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "../../theme";
import { CategoryItem } from "../../types/home.types";
import { useResponsive } from "../../utils/useResponsive";


const ITEM_HEIGHT   = 100;
const ANIM_DURATION = 220;
const EASING        = Easing.out(Easing.quad);


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

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR ITEM
// ─────────────────────────────────────────────────────────────────────────────

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

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.itemOuter,
        {
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
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.gradientWrap, bgStyle]}
        >
          <LinearGradient
            colors={[
              colors.primary + "25",
              colors.primary + "18",
              colors.primary + "10",
              "transparent",
            ]}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {!!item.s3_image_path && (
          <View style={styles.avatarWrap}>
            <Image
              source={{ uri: item.s3_image_path }}
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
    </TouchableOpacity>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED: CategorySidebar
// ─────────────────────────────────────────────────────────────────────────────

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

  return (
    <View
      style={[
        styles.root,
        {
          borderColor: colors.border,
          backgroundColor: colors.surface,
          borderRightWidth: 1,
      
        },
      ]}
    >
      {loading ? (
        <SidebarSkeleton />
      ) : (
        <FlatList
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
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingVertical: spacing(10),
              paddingHorizontal: spacing(5),
            },
          ]}
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
    width: "23%",
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
  gradientWrap: {
    borderRadius: 10,
    overflow: "hidden",
  },
  avatarWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: "hidden",
    marginBottom: 6,
  },
  avatar: { width: "100%", height: "100%" },
  label: {
    textAlign: "center",
  },
});
