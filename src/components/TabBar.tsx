import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  View,
  Text,
  StyleSheet,
  type LayoutChangeEvent,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
  Home,
  LayoutGrid,
  User,
  ShieldCheck,
  Clock,
  AlertCircle,
  Store,
} from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import dealsimage from "../../assets/deal2.png";
import { useB2BApplicationStatus } from "../hooks/b2bHooks";
import { useTabBarVisibility } from "../context/TabBarVisibilityContext";
import { useResponsive } from "../utils/useResponsive";
import {
  TAB_BAR_HEIGHT,
  TAB_BAR_ITEM_GAP,
  getTabBarBottomOffset,
} from "../constants/tabBar";

type TabCfg = {
  label: string;
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
};

const TAB_CONFIG: Record<string, TabCfg> = {
  index: { label: "Home", Icon: Home },
  category: { label: "Categories", Icon: LayoutGrid },
  profile: { label: "Profile", Icon: User },
};

const FALLBACK_CFG: TabCfg = {
  label: "",
  Icon: () => null,
};

const DOCK_HEIGHT = TAB_BAR_HEIGHT;
const TAB_HEIGHT = DOCK_HEIGHT - 10;
const ICON_SIZE = 22;


function useB2BButtonVisual() {
  const { data } = useB2BApplicationStatus();
  const { colors } = useTheme();

  return useMemo(() => {
    const rawStatus = (data?.status || data?.status_badge?.label || "").toLowerCase().trim();
    const rawMessage = (data?.message || data?.status_message || "").toLowerCase().trim();

    // 1. Under Review / In Review / Submitted for Approval -> Rich Yellow / Amber
    // Must be evaluated BEFORE approved to avoid matching "submitted for approval" as "approved"
    const isUnderReview =
      rawStatus === "under review" ||
      rawStatus === "in review" ||
      rawStatus === "under_review" ||
      rawStatus === "in_review" ||
      rawStatus.includes("review") ||
      rawMessage.includes("review");

    const isSubmitted =
      rawStatus === "submitted for approval" ||
      rawStatus === "submitted" ||
      rawStatus.includes("submit") ||
      rawMessage.includes("submit") ||
      rawStatus.includes("pending") ||
      rawMessage.includes("pending") ||
      rawStatus.includes("waiting") ||
      rawMessage.includes("waiting");

    if (isUnderReview || isSubmitted) {
      return {
        title: "Bulk Buyer",
        subtitle: isUnderReview ? "Under Review" : "Submitted",
        bgColor: "#EAB308",
        shadowColor: "#CA8A04",
        borderColor: "rgba(0,0,0,0.08)",
        textColor: "#18181B",
        subtitleColor: "#451A03",
        iconColor: "#18181B",
        badgeBg: "rgba(0,0,0,0.10)",
        Icon: Clock,
      };
    }

    // 2. Approved Wholesale / B2B User -> Deep Emerald Green
    // Strict check: strictly "approved", never substring matching "approv"
    const isApproved =
      !isSubmitted &&
      !isUnderReview &&
      (rawStatus === "approved" ||
        data?.status_badge?.is_approved === true ||
        (data?.is_b2b_user === true && rawStatus !== "draft"));

    if (isApproved) {
      return {
        title: "Bulk Buyer",
        subtitle: "Approved",
        bgColor: "#065F46",
        shadowColor: "#065F46",
        borderColor: "rgba(255,255,255,0.22)",
        textColor: "#FFFFFF",
        subtitleColor: "#A7F3D0",
        iconColor: "#FFFFFF",
        badgeBg: "rgba(255,255,255,0.22)",
        Icon: ShieldCheck,
      };
    }

    // 3. Correction Required -> Red ("Changes Needed")
    const isCorrection =
      rawStatus === "correction required" ||
      rawStatus === "correction_required" ||
      rawStatus.includes("correct") ||
      rawMessage.includes("correct");

    if (isCorrection) {
      return {
        title: "Bulk Buyer",
        subtitle: "Changes Needed",
        bgColor: "#DC2626",
        shadowColor: "#B91C1C",
        borderColor: "rgba(255,255,255,0.22)",
        textColor: "#FFFFFF",
        subtitleColor: "#FECACA",
        iconColor: "#FFFFFF",
        badgeBg: "rgba(255,255,255,0.22)",
        Icon: AlertCircle,
      };
    }

    // 4. Black Listed -> Dark Red ("Blocked")
    const isBlacklisted =
      rawStatus === "black listed" ||
      rawStatus === "blacklisted" ||
      rawStatus.includes("black");

    if (isBlacklisted) {
      return {
        title: "Bulk Buyer",
        subtitle: "Blocked",
        bgColor: "#991B1B",
        shadowColor: "#7F1D1D",
        borderColor: "rgba(255,255,255,0.22)",
        textColor: "#FFFFFF",
        subtitleColor: "#FECACA",
        iconColor: "#FFFFFF",
        badgeBg: "rgba(255,255,255,0.22)",
        Icon: AlertCircle,
      };
    }

    // 5. Deactivated -> Slate Muted ("Inactive")
    const isDeactivated =
      rawStatus === "deactivated" ||
      rawStatus.includes("deactivat") ||
      rawStatus.includes("inactive") ||
      rawStatus.includes("reject");

    if (isDeactivated) {
      return {
        title: "Bulk Buyer",
        subtitle: "Inactive",
        bgColor: "#4B5563",
        shadowColor: "#374151",
        borderColor: "rgba(255,255,255,0.22)",
        textColor: "#FFFFFF",
        subtitleColor: "#E5E7EB",
        iconColor: "#FFFFFF",
        badgeBg: "rgba(255,255,255,0.22)",
        Icon: AlertCircle,
      };
    }

    // 6. Draft / Incomplete Application -> Warm Orange ("Draft")
    const isDraft =
      rawStatus === "draft" ||
      rawStatus === "incomplete" ||
      (data?.has_application && !rawStatus);

    if (isDraft) {
      return {
        title: "Bulk Buyer",
        subtitle: "Draft",
        bgColor: "#EA580C",
        shadowColor: "#C2410C",
        borderColor: "rgba(255,255,255,0.22)",
        textColor: "#FFFFFF",
        subtitleColor: "#FFEDD5",
        iconColor: "#FFFFFF",
        badgeBg: "rgba(255,255,255,0.22)",
        Icon: Clock,
      };
    }

    // 7. Default / Not Applied (New Buyer / Guest) -> Brand Primary Purple
    return {
      title: "Become a",
      subtitle: "Bulk Buyer",
      bgColor: colors.primary,
      shadowColor: "#4C1D95",
      borderColor: "rgba(255,255,255,0.22)",
      textColor: "#FFFFFF",
      subtitleColor: "#E0D9F3",
      iconColor: "#FFFFFF",
      badgeBg: "rgba(255,255,255,0.22)",
      Icon: Store,
    };
  }, [data, colors.primary]);
}

// ─────────────────────────────────────────────────────────
// Floating bottom navigation
// ─────────────────────────────────────────────────────────
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const visibility = useTabBarVisibility();
  const b2bVisual = useB2BButtonVisual();
  const { colors } = useTheme();
  const { width } = useResponsive();
  const [tabsWidth, setTabsWidth] = useState(0);
  const activeIndex = useSharedValue(state.index);
  const tabWidth = Math.max(
    0,
    (tabsWidth - TAB_BAR_ITEM_GAP * (state.routes.length - 1)) /
      state.routes.length,
  );

  const handleTabsLayout = useCallback((event: LayoutChangeEvent) => {
    setTabsWidth(event.nativeEvent.layout.width);
  }, []);

  useEffect(() => {
    activeIndex.value = withTiming(state.index, {
      duration: 240,
      easing: Easing.out(Easing.cubic),
    });
  }, [state.index, activeIndex]);

  const activeBackgroundStyle = useAnimatedStyle(
    () => ({
      transform: [
        { translateX: activeIndex.value * (tabWidth + TAB_BAR_ITEM_GAP) },
      ],
    }),
    [tabWidth],
  );

  // Responsive dock height and card width
  const B2B_CARD_WIDTH = Math.min(126, Math.max(112, Math.round(width * 0.29)));
  const tabBarVisible = visibility?.tabBarVisible;

  // Focus changes must never replay the scroll-driven dock animation.
  // This also handles tab changes triggered outside this component.
  useEffect(() => {
    if (tabBarVisible) tabBarVisible.value = 1;
  }, [state.index, tabBarVisible]);

  // Android safe area and bottom system navigation handling
  const bottomOffset = getTabBarBottomOffset(insets.bottom);

  const animatedDockStyle = useAnimatedStyle(() => {
    const progress = visibility?.tabBarVisible?.value ?? 1;
    const translateY = interpolate(
      progress,
      [0, 1],
      [120, 0],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ translateY }],
    };
  });

  const handlePress = useCallback(
    (routeKey: string, routeName: string, isFocused: boolean) => {
      const event = navigation.emit({
        type: "tabPress",
        target: routeKey,
        canPreventDefault: true,
      });
      if (!event.defaultPrevented && tabBarVisible) {
        // A direct assignment cancels any in-progress hide/show animation.
        tabBarVisible.value = 1;
      }
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(routeName);
      }
    },
    [navigation, tabBarVisible],
  );

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.dockOuterContainer,
        { bottom: bottomOffset },
        animatedDockStyle,
      ]}
    >
      <View
        style={[
          styles.navPill,
          {
            height: DOCK_HEIGHT,
            backgroundColor: colors.tabBar,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.tabsGroup} onLayout={handleTabsLayout}>
          {tabsWidth > 0 && (
            <Animated.View
              collapsable={false}
              pointerEvents="none"
              style={[
                styles.tabActiveBackground,
                { width: tabWidth, backgroundColor: colors.primaryLight },
                activeBackgroundStyle,
              ]}
            />
          )}
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const cfg = TAB_CONFIG[route.name] ?? FALLBACK_CFG;
            const color = isFocused ? colors.primary : colors.textSecondary;

            return (
              <Pressable
                key={route.key}
                onPress={() => handlePress(route.key, route.name, isFocused)}
                onLongPress={() =>
                  navigation.emit({ type: "tabLongPress", target: route.key })
                }
                accessibilityRole="tab"
                accessibilityState={{ selected: isFocused }}
                accessibilityLabel={cfg.label}
                android_ripple={null}
                style={styles.tabPressable}
              >
                <View collapsable={false} style={styles.tabItemContainer}>
                  <View style={styles.iconFrame}>
                    <cfg.Icon size={ICON_SIZE} color={color} strokeWidth={2} />
                  </View>
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit={false}
                    style={[
                      styles.tabLabel,
                      { color, fontSize: width < 360 ? 9 : 10 },
                    ]}
                  >
                    {cfg.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* ── 2. Circular Hot Deal Promotional Element (4th element inside pill) ── */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Hot deals"
          onPress={() => {
            if (tabBarVisible) tabBarVisible.value = 1;
            router.push("/(stack)/deals");
          }}
          style={[
            styles.dealCircleButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Image
            source={dealsimage}
            contentFit="contain"
            style={styles.dealImage}
          />
        </Pressable>
      </View>

      {/* ── 3. Right-Side B2B Promotional Card (Zepto-Inspired Floating Card) ── */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={[b2bVisual.title, b2bVisual.subtitle]
          .filter(Boolean)
          .join(", ")}
        onPress={() => {
          if (tabBarVisible) tabBarVisible.value = 1;
          router.push("/b2b");
        }}
        style={[
          styles.b2bPromoCard,
          {
            width: B2B_CARD_WIDTH + insets.right,
            height: DOCK_HEIGHT,
            paddingRight: 10 + insets.right,
            backgroundColor: b2bVisual.bgColor,
            shadowColor: b2bVisual.shadowColor,
            borderColor: b2bVisual.borderColor,
          },
        ]}
      >
        <View style={styles.b2bTextContainer}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            style={[
              styles.b2bTitle,
              {
                color: b2bVisual.textColor,
                fontSize: width < 360 ? 9.5 : 10.5,
              },
            ]}
          >
            {b2bVisual.title}
          </Text>
          {b2bVisual.subtitle ? (
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
              style={[
                styles.b2bSubtitle,
                {
                  color: b2bVisual.subtitleColor || b2bVisual.textColor,
                  fontSize: width < 360 ? 10.5 : 11.5,
                },
              ]}
            >
              {b2bVisual.subtitle}
            </Text>
          ) : null}
        </View>
        <View
          style={[
            styles.b2bIconBadge,
            { backgroundColor: b2bVisual.badgeBg },
          ]}
        >
          <b2bVisual.Icon
            size={16}
            color={b2bVisual.iconColor}
            strokeWidth={2.3}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dockOuterContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
    paddingRight: 0,
    gap: TAB_BAR_ITEM_GAP,
    zIndex: 100,
  },
  // Main Floating Navigation Pill
  navPill: {
    flex: 1,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: TAB_BAR_ITEM_GAP,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
  },
  tabPressable: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    height: TAB_HEIGHT,
  },
  tabsGroup: {
    flex: 1,
    minWidth: 0,
    height: TAB_HEIGHT,
    flexDirection: "row",
    gap: TAB_BAR_ITEM_GAP,
  },
  tabItemContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    // Keep geometry identical on every tab so focus never resizes the icon.
    width: "100%",
    height: TAB_HEIGHT,
    borderRadius: TAB_HEIGHT / 2,
    overflow: "hidden",
    paddingHorizontal: 2,
    gap: 2,
  },
  tabActiveBackground: {
    position: "absolute",
    left: 0,
    top: 0,
    height: TAB_HEIGHT,
    borderRadius: TAB_HEIGHT / 2,
    overflow: "hidden",
  },
  iconFrame: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 10,
    lineHeight: 13,
    height: 13,
    width: "100%",
    flexShrink: 0,
    includeFontPadding: false,
    textAlign: "center",
    maxWidth: "100%",
  },
  // Circular Hot Deal Element inside Navigation Pill
  dealCircleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  dealImage: {
    width: "82%",
    height: "82%",
  },
  // Right-Side Promotional Card (Flush with right screen edge)
  b2bPromoCard: {
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    flexShrink: 0,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderRightWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 10,
    paddingVertical: 5,
  },
  b2bTextContainer: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
    gap: 1,
  },
  b2bTitle: {
    fontFamily: "Poppins_600SemiBold",
    lineHeight: 13,
    includeFontPadding: false,
    letterSpacing: 0.1,
  },
  b2bSubtitle: {
    fontFamily: "Poppins_700Bold",
    lineHeight: 15,
    includeFontPadding: false,
    letterSpacing: 0.2,
  },
  b2bIconBadge: {
    width: 28,
    height: 28,
    flexShrink: 0,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
});

export { TabBar as IOSTabBar, TabBar as AndroidTabBar, TabBar as FloatingTabBar };
