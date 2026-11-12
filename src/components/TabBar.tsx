import React, { useCallback, useMemo } from "react";
import { Platform, Pressable, View, Text } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
  Home,
  LayoutGrid,
  User,
  Clock,
  ShieldCheck,
  Store,
  AlertCircle,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import dealsimage from "../../assets/deal2.png";
import { useB2BApplicationStatus } from "../hooks/b2bHooks";
import { useTabBarVisibility } from "../context/TabBarVisibilityContext";

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

// ─────────────────────────────────────────────────────────
// Dynamic B2B Visual State Hook
// ─────────────────────────────────────────────────────────
function useB2BButtonVisual() {
  const { data } = useB2BApplicationStatus();

  return useMemo(() => {
    if (!data || !data.has_application || !data.status) {
      return {
        title: "Become a",
        subtitle: "Bulk Buyer",
        gradient: ["#20086b", "#5f16e9"] as [string, string],
        bgColor: "#5f16e9",
        shadowColor: "#5f16e9",
        Icon: Store,
      };
    }

    const s = (data.status || "").toLowerCase().trim();
    if (data.is_b2b_user || s === "approved") {
      return {
        title: "Bulk Buyer",
        subtitle: "Approved",
        gradient: ["#064e3b", "#059669"] as [string, string],
        bgColor: "#059669",
        shadowColor: "#059669",
        Icon: ShieldCheck,
      };
    }

    const isSubmitted =
      s === "submitted for approval" || s === "submitted" || s.includes("submit");
    if (isSubmitted) {
      return {
        title: "Bulk Buyer",
        subtitle: "Submitted",
        gradient: ["#805009", "#a66a10"] as [string, string],
        bgColor: "#a66a10",
        shadowColor: "#805009",
        Icon: Clock,
      };
    }

    const isUnderReview = s.includes("review");
    if (isUnderReview) {
      return {
        title: "Bulk Buyer",
        subtitle: "In Review",
        gradient: ["#1e3a8a", "#2563eb"] as [string, string],
        bgColor: "#2563eb",
        shadowColor: "#1e3a8a",
        Icon: Clock,
      };
    }

    const isCorrection = s.includes("correct");
    if (isCorrection) {
      return {
        title: "Bulk Buyer",
        subtitle: "Action Req.",
        gradient: ["#7f1d1d", "#dc2626"] as [string, string],
        bgColor: "#dc2626",
        shadowColor: "#7f1d1d",
        Icon: AlertCircle,
      };
    }

    return {
      title: "Bulk Buyer",
      subtitle: "Setup",
      gradient: ["#7c2d12", "#d97706"] as [string, string],
      bgColor: "#d97706",
      shadowColor: "#d97706",
      Icon: Clock,
    };
  }, [data]);
}

// ─────────────────────────────────────────────────────────
// Unified Floating Dock TabBar (iOS & Android)
// ─────────────────────────────────────────────────────────
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const visibility = useTabBarVisibility();
  const b2bVisual = useB2BButtonVisual();
  const { colors } = useTheme();

  const bottomOffset = Platform.select({
    ios: (insets.bottom || 0) > 0 ? insets.bottom - 13 : 12,
    default: Math.max(insets.bottom || 0, 12),
  });

  const animatedDockStyle = useAnimatedStyle(() => {
    const progress = visibility?.tabBarVisible?.value ?? 1;
    const translateY = interpolate(
      progress,
      [0, 1],
      [110, 0],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      progress,
      [0, 0.35, 1],
      [0, 0.7, 1],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  const handlePress = useCallback(
    (routeKey: string, routeName: string, isFocused: boolean) => {
      if (visibility) {
        visibility.tabBarVisible.value = withTiming(1, { duration: 200 });
      }
      const event = navigation.emit({
        type: "tabPress",
        target: routeKey,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(routeName);
      }
    },
    [navigation, visibility],
  );

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: bottomOffset,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 10,
          gap: 8,
          zIndex: 100,
        },
        animatedDockStyle,
      ]}
    >
      {/* ── Main Tabs Capsule (White Dock with Home, Categories, Profile & Deals) ── */}
      <View
        style={{
          flex: 1,
          backgroundColor: "#FFFFFF",
          borderRadius: 40,
          height: 58,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 6,
          paddingVertical: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 10,
          elevation: 8,
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.06)",
        }}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const cfg = TAB_CONFIG[route.name] ?? FALLBACK_CFG;
          const activeColor = colors.primary; // App Brand Primary Color (#5f16e9)
          const activeBg = colors.primaryLight; // Subtle primary tint
          const inactiveColor = colors.text;

          return (
            <Pressable
              key={route.key}
              onPress={() => handlePress(route.key, route.name, isFocused)}
              android_ripple={null}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <View
                style={{
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: isFocused ? "92%" : "auto",
                  paddingHorizontal: isFocused ? 14 : 6,
                  paddingVertical: 5,
                  borderRadius: 24,
                  backgroundColor: isFocused ? activeBg : "transparent",
                  gap: 2,
                }}
              >
                <cfg.Icon
                  size={20}
                  color={isFocused ? activeColor : inactiveColor}
                  strokeWidth={isFocused ? 2.4 : 2}
                />
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: isFocused
                      ? "Poppins_600SemiBold"
                      : "Poppins_500Medium",
                    fontSize: 10,
                    color: isFocused ? activeColor : inactiveColor,
                    lineHeight: 13,
                  }}
                >
                  {cfg.label}
                </Text>
              </View>
            </Pressable>
          );
        })}

        {/* ── Deals Button (Inside White Capsule as 4th element) ── */}
        <Pressable
          onPress={() => {
            if (visibility) {
              visibility.tabBarVisible.value = withTiming(1, { duration: 200 });
            }
            router.push("/(stack)/deals");
          }}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "#FFFFFF",
            borderWidth: 1.5,
            borderColor: "#D1D5DB",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            marginRight: 3,
            marginLeft: 2,
          }}
        >
          <Image
            source={dealsimage}
            contentFit="cover"
            style={{ width: "100%", height: "100%", borderRadius: 22 }}
          />
        </Pressable>
      </View>

      {/* ── Bulk Order FAB (Replacing 'select FINDS' on right) ── */}
      <Pressable
        onPress={() => {
          if (visibility) {
            visibility.tabBarVisible.value = withTiming(1, { duration: 200 });
          }
          router.push("/b2b");
        }}
        style={{
          width: 106,
          height: 58,
          borderRadius: 20,
          overflow: "hidden",
          shadowColor: b2bVisual.shadowColor || "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.22,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <LinearGradient
          colors={b2bVisual.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 8,
            paddingVertical: 6,
            gap: 4,
          }}
        >
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: "Poppins_500Medium",
                fontSize: 9.5,
                color: "rgba(255,255,255,0.85)",
                lineHeight: 12,
              }}
            >
              {b2bVisual.title}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: "Poppins_700Bold",
                fontSize: 11,
                color: "#ffffff",
                lineHeight: 14,
                letterSpacing: 0.2,
              }}
            >
              {b2bVisual.subtitle}
            </Text>
          </View>

          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: "rgba(255,255,255,0.22)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <b2bVisual.Icon size={16} color="#ffffff" strokeWidth={2.2} />
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export { TabBar as IOSTabBar, TabBar as AndroidTabBar, TabBar as FloatingTabBar };
