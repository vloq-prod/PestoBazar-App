import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Platform,
  ScrollView,
  StatusBar as RNStatusBar,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../theme";
import { useResponsive } from "../utils/useResponsive";

// ─── Single Shimmer Bone (Pure Gray) ──────────────────────────
export const ShimmerBone = ({
  width,
  height,
  borderRadius = 8,
  boneColor,
  style,
}: {
  width?: number | string;
  height: number;
  borderRadius?: number;
  boneColor?: string;
  style?: any;
}) => {
  const { colors } = useTheme();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.45, 1]),
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: boneColor || colors.backgroundSkeleton,
        },
        animStyle,
        style,
      ]}
    />
  );
};

// ─── Home Screen Skeleton ─────────────────────────────────────
const HomeScreenSkeleton: React.FC = () => {
  const { colors } = useTheme();
  const { spacing } = useResponsive();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const TOP_PADDING = Platform.OS === "android" ? spacing(10) : 0;
  const H_PAD = spacing(16);
  const TOP_CATEGORY_PAD = spacing(10);
  const topCategoryItemWidth = (width - TOP_CATEGORY_PAD * 2) / 5;
  const TOP_CATEGORY_IMG_SIZE = spacing(52);

  // Sliding banners dimensions (matches SlidingBanners component)
  const BANNER_WIDTH = width - H_PAD * 2;
  const BANNER_HEIGHT = BANNER_WIDTH * 0.5;

  // Bottom Category Cards dimensions (matches CategoryCardSection: 4 cols x 2 rows)
  const GRID_COLUMNS = 4;
  const GRID_GAP = spacing(10);
  const categoryCardSize = Math.floor(
    (width - H_PAD * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS
  );

  const GRAY_BONE = colors.backgroundSkeleton;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <RNStatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <StatusBar style="dark" backgroundColor="transparent" translucent />

      {/* ── Top Header (Clean Gray Skeleton) ── */}
      <View
        style={[
          styles.headerContainer,
          {
            backgroundColor: colors.surface,
            paddingTop: insets.top + TOP_PADDING,
            paddingBottom: spacing(14),
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          },
        ]}
      >
        {/* 1. Navbar Row */}
        <View style={[styles.navbarRow, { paddingHorizontal: H_PAD }]}>
          {/* Left Greeting & Name */}
          <View style={{ gap: spacing(6) }}>
            <ShimmerBone
              width={spacing(100)}
              height={spacing(12)}
              borderRadius={spacing(4)}
              boneColor={GRAY_BONE}
            />
            <ShimmerBone
              width={spacing(145)}
              height={spacing(18)}
              borderRadius={spacing(4)}
              boneColor={GRAY_BONE}
            />
          </View>

          {/* Right Action Icons (Notifications + Avatar) */}
          <View style={styles.headerRight}>
            <ShimmerBone
              width={spacing(40)}
              height={spacing(40)}
              borderRadius={spacing(20)}
              boneColor={GRAY_BONE}
            />
            <ShimmerBone
              width={spacing(45)}
              height={spacing(45)}
              borderRadius={spacing(22.5)}
              boneColor={GRAY_BONE}
            />
          </View>
        </View>

        {/* 2. Search Bar Placeholder */}
        <View style={{ paddingHorizontal: H_PAD, marginTop: spacing(12) }}>
          <View
            style={[
              styles.searchBar,
              {
                height: spacing(44),
                borderRadius: spacing(12),
                backgroundColor: colors.backgroundgray ?? colors.surface,
                borderColor: colors.border,
                paddingHorizontal: spacing(12),
              },
            ]}
          >
            {/* Pesto icon bone */}
            <ShimmerBone
              width={spacing(24)}
              height={spacing(24)}
              borderRadius={spacing(6)}
              boneColor={GRAY_BONE}
            />

            {/* Search text bone */}
            <View style={{ flex: 1, marginHorizontal: spacing(10) }}>
              <ShimmerBone
                width="65%"
                height={spacing(14)}
                borderRadius={spacing(4)}
                boneColor={GRAY_BONE}
              />
            </View>

            {/* Search icon bone */}
            <ShimmerBone
              width={spacing(20)}
              height={spacing(20)}
              borderRadius={spacing(10)}
              boneColor={GRAY_BONE}
            />
          </View>
        </View>

        {/* 3. Horizontal Category Row (5 items) */}
        <View
          style={[
            styles.categoryRow,
            {
              paddingHorizontal: TOP_CATEGORY_PAD,
              marginTop: spacing(14),
            },
          ]}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <View
              key={index}
              style={{
                width: topCategoryItemWidth,
                alignItems: "center",
              }}
            >
              {/* Category Icon */}
              <ShimmerBone
                width={TOP_CATEGORY_IMG_SIZE}
                height={TOP_CATEGORY_IMG_SIZE}
                borderRadius={spacing(12)}
                boneColor={GRAY_BONE}
              />
              {/* Category Label */}
              <ShimmerBone
                width={topCategoryItemWidth * 0.72}
                height={spacing(8)}
                borderRadius={spacing(4)}
                boneColor={GRAY_BONE}
                style={{ marginTop: spacing(6) }}
              />
            </View>
          ))}
        </View>
      </View>

      {/* ── Scrollable Body ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{ paddingBottom: spacing(40) }}
      >
        {/* 4. Header Promotional Banner (140px) */}
        <View style={{ paddingHorizontal: H_PAD, marginTop: spacing(14) }}>
          <ShimmerBone
            width="100%"
            height={140}
            borderRadius={spacing(12)}
            boneColor={GRAY_BONE}
          />
        </View>

        {/* 5. Main Sliding Banners Carousel */}
        <View style={{ paddingHorizontal: H_PAD, marginTop: spacing(16) }}>
          <ShimmerBone
            width={BANNER_WIDTH}
            height={BANNER_HEIGHT}
            borderRadius={14}
            boneColor={GRAY_BONE}
          />
        </View>

        {/* 6. Bottom Category Card Section (Title + 4 cols x 2 rows) */}
        <View style={{ paddingHorizontal: H_PAD, marginTop: spacing(26) }}>
          {/* Section Heading & View All Button Placeholder */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: spacing(14),
            }}
          >
            <ShimmerBone
              width={spacing(160)}
              height={spacing(18)}
              borderRadius={spacing(5)}
              boneColor={GRAY_BONE}
            />
            <ShimmerBone
              width={spacing(60)}
              height={spacing(14)}
              borderRadius={spacing(4)}
              boneColor={GRAY_BONE}
            />
          </View>

          {/* 4 columns x 2 rows Grid */}
          <View style={{ gap: GRID_GAP }}>
            {/* Row 1 */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <View
                  key={`cat-sk-1-${i}`}
                  style={{ width: categoryCardSize, alignItems: "center" }}
                >
                  <ShimmerBone
                    width={categoryCardSize}
                    height={categoryCardSize}
                    borderRadius={spacing(12)}
                    boneColor={GRAY_BONE}
                  />
                  <ShimmerBone
                    width={categoryCardSize * 0.76}
                    height={spacing(9)}
                    borderRadius={spacing(4)}
                    boneColor={GRAY_BONE}
                    style={{ marginTop: spacing(6) }}
                  />
                  <ShimmerBone
                    width={categoryCardSize * 0.52}
                    height={spacing(8)}
                    borderRadius={spacing(4)}
                    boneColor={GRAY_BONE}
                    style={{ marginTop: spacing(4) }}
                  />
                </View>
              ))}
            </View>

            {/* Row 2 */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <View
                  key={`cat-sk-2-${i}`}
                  style={{ width: categoryCardSize, alignItems: "center" }}
                >
                  <ShimmerBone
                    width={categoryCardSize}
                    height={categoryCardSize}
                    borderRadius={spacing(12)}
                    boneColor={GRAY_BONE}
                  />
                  <ShimmerBone
                    width={categoryCardSize * 0.76}
                    height={spacing(9)}
                    borderRadius={spacing(4)}
                    boneColor={GRAY_BONE}
                    style={{ marginTop: spacing(6) }}
                  />
                  <ShimmerBone
                    width={categoryCardSize * 0.52}
                    height={spacing(8)}
                    borderRadius={spacing(4)}
                    boneColor={GRAY_BONE}
                    style={{ marginTop: spacing(4) }}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Category Section Pagination Dots */}
          <View style={[styles.dotsRow, { marginTop: spacing(16) }]}>
            <ShimmerBone
              width={spacing(18)}
              height={spacing(5)}
              borderRadius={spacing(3)}
              boneColor={GRAY_BONE}
            />
            <ShimmerBone
              width={spacing(5)}
              height={spacing(5)}
              borderRadius={spacing(3)}
              boneColor={GRAY_BONE}
            />
            <ShimmerBone
              width={spacing(5)}
              height={spacing(5)}
              borderRadius={spacing(3)}
              boneColor={GRAY_BONE}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreenSkeleton;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerContainer: {
    width: "100%",
  },
  navbarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
});
