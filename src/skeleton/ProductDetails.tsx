import React, { useEffect } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme";


// ─── Single shimmer bone ──────────────────────────────────────
const Bone = ({
  width,
  height,
  borderRadius = 8,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
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
          backgroundColor: colors.backgroundSkeleton,
        },
        animStyle,
        style,
      ]}
    />
  );
};

// ─── Main Skeleton ────────────────────────────────────────────
const ProductDetailsSkeleton = () => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const CAROUSEL_HEIGHT = width * 0.88;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>

      {/* ── Carousel ── */}
      <Bone width={width} height={CAROUSEL_HEIGHT} borderRadius={0} />

      {/* ── Dots ── */}
      <View style={styles.dotsRow}>
        <Bone width={18} height={6} borderRadius={3} />
        <Bone width={6} height={6} borderRadius={3} />
        <Bone width={6} height={6} borderRadius={3} />
        <Bone width={6} height={6} borderRadius={3} />
      </View>

      <View style={styles.infoBlock}>

        {/* ── Product Title ── */}
        <Bone width="90%" height={22} borderRadius={6} />
        <Bone width="65%" height={18} borderRadius={6} style={{ marginTop: 6 }} />

        {/* ── Badge row ── */}
        <View style={styles.row}>
          <Bone width={80} height={26} borderRadius={20} />
          <Bone width={90} height={26} borderRadius={20} />
        </View>

        {/* ── Price card ── */}
        <View
       
        >
          <View style={[styles.row, { alignItems: "center" }]}>
            <Bone width={100} height={30} borderRadius={6} />
            <Bone width={80} height={22} borderRadius={20} />
          </View>
          <Bone width={180} height={14} borderRadius={5} style={{ marginTop: 8 }} />
        </View>

 

        {/* ── Overview lines ── */}
        <View style={styles.overviewBlock}>
          <Bone width="100%" height={13} borderRadius={5} />
          <Bone width="96%" height={13} borderRadius={5} />
          <Bone width="80%" height={13} borderRadius={5} />
        </View>
      </View>

      {/* ── Description section ── */}
      <View style={[styles.sectionDivider, { backgroundColor: colors.border + "60" }]} />

      <View style={styles.descBlock}>
        {/* Card 1 */}
        <View style={styles.descCard}>
          <View style={styles.descTitleRow}>
       
            <Bone width="55%" height={18} borderRadius={6} />
          </View>
          <Bone width="100%" height={13} borderRadius={5} />
          <Bone width="92%" height={13} borderRadius={5} />
          <Bone width="70%" height={13} borderRadius={5} />
        </View>

        {/* Card 2 */}
        <View style={[styles.descCard, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 18 }]}>
          <View style={styles.descTitleRow}>
            <Bone width={4} height={20} borderRadius={4} />
            <Bone width="45%" height={18} borderRadius={6} />
          </View>
          <Bone width="100%" height={13} borderRadius={5} />
          <Bone width="88%" height={13} borderRadius={5} />
          <Bone width="60%" height={13} borderRadius={5} />
        </View>
      </View>

      {/* ── Footer ── */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom: Math.max(insets.bottom, 12),
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={styles.footerRow}>
          {/* Cart icon compact */}
          <Bone width={52} height={52} borderRadius={12} />
          {/* Add to cart button */}
          <Bone
            width={undefined}
            height={52}
            borderRadius={12}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </View>
  );
};

export default ProductDetailsSkeleton;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: -20,
    marginBottom: 4,
  },
  infoBlock: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  priceCard: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  deliveryStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  overviewBlock: {
    gap: 7,
  },
  sectionDivider: {
    height: 8,
    marginTop: 20,
  },
  descBlock: {
    paddingHorizontal: 16,
    paddingTop: 6,
    gap: 0,
  },
  descCard: {
    paddingVertical: 18,
    gap: 8,
  },
  descTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});