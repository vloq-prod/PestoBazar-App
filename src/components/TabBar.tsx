import { useCallback, useEffect, useRef, useMemo } from "react";
import { Platform, Pressable, View, LayoutChangeEvent } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Home, LayoutGrid, User, Briefcase, Clock, ShieldCheck } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import dealsimage from "../../assets/deal2.png";
import { useB2BApplicationStatus } from "../hooks/b2bHooks";

type TabCfg = {
  label: string;
  Icon: React.ComponentType<{ size: number; color: string }>;
};

const TAB_CONFIG: Record<string, TabCfg> = {
  index: { label: "Home", Icon: Home },
  category: { label: "Category", Icon: LayoutGrid },
  profile: { label: "Profile", Icon: User },
};

const FALLBACK_CFG: TabCfg = {
  label: "",
  Icon: () => null,
};

const SPRING_CFG = { damping: 18, stiffness: 180, mass: 0.8 } as const;
const TIMING_CFG = {
  duration: 220,
  easing: Easing.out(Easing.quad),
} as const;

// ─────────────────────────────────────────────────────────
// iOS TabItem
// ─────────────────────────────────────────────────────────
function IOSTabItem({
  routeName,
  isFocused,
  activeColor,
  inactiveColor,
  onPress,
  onLongPress,
  onLayout,
}: {
  routeName: string;
  isFocused: boolean;
  activeColor: string;
  inactiveColor: string;
  onPress: () => void;
  onLongPress: () => void;
  onLayout: (e: LayoutChangeEvent) => void;
}) {
  const cfg = TAB_CONFIG[routeName] ?? FALLBACK_CFG;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onLayout={onLayout}
      android_ripple={null}
      className="flex-1 items-center justify-center px-2 py-2.5 gap-0.5"
      style={{ borderRadius: 40 }}
    >
      <cfg.Icon size={22} color={isFocused ? activeColor : inactiveColor} />
      <Animated.Text
        numberOfLines={1}
        className="text-[10px] text-center leading-[14px]"
        style={{
          fontFamily: "Poppins_500Medium",
          color: isFocused ? activeColor : inactiveColor,
        }}
      >
        {cfg.label}
      </Animated.Text>
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────
// Android TabItem
// ─────────────────────────────────────────────────────────
function AndroidTabItem({
  routeName,
  isFocused,
  activeColor,
  inactiveColor,
  onPress,
  onLongPress,
}: {
  routeName: string;
  isFocused: boolean;
  activeColor: string;
  inactiveColor: string;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const cfg = TAB_CONFIG[routeName] ?? FALLBACK_CFG;
  const progress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isFocused ? 1 : 0, TIMING_CFG);
  }, [isFocused, progress]);

  const borderStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scaleX: progress.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      android_ripple={null}
      style={{
        flex: 1,
        minWidth: 0,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 8,
        paddingBottom: 6,
        gap: 3,
      }}
    >
      {/* Top indicator bar */}
      <Animated.View
        className="absolute top-0 h-[2.5px] rounded-b-sm"
        style={[
          { left: "15%", right: "15%", backgroundColor: activeColor },
          borderStyle,
        ]}
      />
      <cfg.Icon size={21} color={isFocused ? activeColor : inactiveColor} />
      <Animated.Text
        numberOfLines={1}
        style={{
          fontFamily: "Poppins_500Medium",
          fontSize: 10,
          lineHeight: 14,
          textAlign: "center",
          color: isFocused ? activeColor : inactiveColor,
        }}
      >
        {cfg.label}
      </Animated.Text>
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────
// Dynamic B2B Visual State Hook
// ─────────────────────────────────────────────────────────
function useB2BButtonVisual() {
  const { data } = useB2BApplicationStatus();

  return useMemo(() => {
    if (!data || !data.has_application || !data.status) {
      return {
        gradient: ["#20086b", "#5f16e9"] as [string, string],
        bgColor: "#20086b",
        shadowColor: "#000",
        Icon: Briefcase,
      };
    }

    const s = (data.status || "").toLowerCase().trim();
    if (data.is_b2b_user || s === "approved") {
      return {
        gradient: ["#047857", "#10B981"] as [string, string],
        bgColor: "#047857",
        shadowColor: "#047857",
        Icon: ShieldCheck,
      };
    }

    // Pending, Under Review, Submitted, Correction Required, Draft
    return {
      gradient: ["#D97706", "#F59E0B"] as [string, string],
      bgColor: "#D97706",
      shadowColor: "#D97706",
      Icon: Clock,
    };
  }, [data]);
}

// ─────────────────────────────────────────────────────────
// iOS TabBar — floating pill style
// ─────────────────────────────────────────────────────────
function IOSTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomOffset = (insets.bottom || 0) + -13;
  const pillInset = 3;
  const b2bVisual = useB2BButtonVisual();

  const tabLayouts = useRef<{ x: number; width: number }[]>([]);
  const pillX = useSharedValue(0);
  const pillWidth = useSharedValue(0);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
    width: pillWidth.value,
  }));

  const handleLayout = useCallback(
    (index: number, e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout;
      tabLayouts.current[index] = { x, width };
      if (index === state.index) {
        pillX.value = x;
        pillWidth.value = width;
      }
    },
    [state.index, pillX, pillWidth],
  );

  useEffect(() => {
    const layout = tabLayouts.current[state.index];
    if (!layout) return;
    pillX.value = withSpring(layout.x, SPRING_CFG);
    pillWidth.value = withSpring(layout.width, SPRING_CFG);
  }, [state.index, pillX, pillWidth]);

  const handlePress = useCallback(
    (routeKey: string, routeName: string, isFocused: boolean) => {
      const event = navigation.emit({
        type: "tabPress",
        target: routeKey,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) navigation.navigate(routeName);
    },
    [navigation],
  );

  const handleLongPress = useCallback(
    (routeKey: string) => {
      navigation.emit({ type: "tabLongPress", target: routeKey });
    },
    [navigation],
  );

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        position: "absolute",
        left: 0,
        right: 0,
        bottom: bottomOffset,
      }}
    >
      <View
        style={{
          flex: 1,
          paddingLeft: 12,
          paddingRight: 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.2,
          shadowRadius: 9,
          elevation: 8,
        }}
      >
        <View
          style={{
            backgroundColor: colors.background,
            borderRadius: 40,
            borderColor: colors.border,
            borderWidth: 1,
            padding: pillInset,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              position: "relative",
              borderRadius: 40 - pillInset,
              overflow: "hidden",
            }}
          >
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  borderRadius: 40 - pillInset,
                  backgroundColor: colors.primary,
                },
                pillStyle,
              ]}
            />
            {state.routes.map((route, index) => {
              const isFocused = state.index === index;
              return (
                <IOSTabItem
                  key={route.key}
                  routeName={route.name}
                  isFocused={isFocused}
                  activeColor={colors.textInverse}
                  inactiveColor={colors.text}
                  onPress={() => handlePress(route.key, route.name, isFocused)}
                  onLongPress={() => handleLongPress(route.key)}
                  onLayout={(e) => handleLayout(index, e)}
                />
              );
            })}
          </View>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginRight: 14,
        }}
      >
        {/* Deals circle button */}
        <Pressable
          onPress={() => router.push("/(stack)/deals")}
          style={{
            width: 64,
            height: 64,
            borderRadius: 999,
            backgroundColor: colors.background,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.2,
            shadowRadius: 9,
            elevation: 8,
            overflow: "hidden",
          }}
        >
          <Image
            style={{ width: "100%", height: "100%", borderRadius: 999 }}
            source={dealsimage}
            contentFit="cover"
          />
        </Pressable>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// Android TabBar — flat border-top style
// ─────────────────────────────────────────────────────────
function AndroidTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const b2bVisual = useB2BButtonVisual();

  const handlePress = useCallback(
    (routeKey: string, routeName: string, isFocused: boolean) => {
      const event = navigation.emit({
        type: "tabPress",
        target: routeKey,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) navigation.navigate(routeName);
    },
    [navigation],
  );

  const handleLongPress = useCallback(
    (routeKey: string) => {
      navigation.emit({ type: "tabLongPress", target: routeKey });
    },
    [navigation],
  );

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: colors.tabBar,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: insets.bottom || 10,
        alignItems: "center",
      }}
    >
      {/* Regular tabs — flex: 1 each */}
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        return (
          <AndroidTabItem
            key={route.key}
            routeName={route.name}
            isFocused={isFocused}
            activeColor={colors.primary}
            inactiveColor={colors.tabBarInactive}
            onPress={() => handlePress(route.key, route.name, isFocused)}
            onLongPress={() => handleLongPress(route.key)}
          />
        );
      })}

      {/* ── Deals & B2B — vertical left divider + circular buttons ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 6,
          paddingBottom: 4,
          paddingRight: 10,
          gap: 8,
        }}
      >
        {/* Straight vertical divider */}
        <View
          style={{
            width: 1,
            height: 38,
            backgroundColor: colors.border,
            marginRight: 4,
          }}
        />

        {/* Deals circle button */}
        <Pressable
          android_ripple={null}
          onPress={() => router.push("/(stack)/deals")}
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: colors.surfaceElevated,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <Image
            source={dealsimage}
            contentFit="cover"
            style={{ width: "100%", height: "100%", borderRadius: 26 }}
          />
        </Pressable>

     
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// Main Export — Platform switch
// ─────────────────────────────────────────────────────────
export function TabBar(props: BottomTabBarProps) {
  return Platform.OS === "ios" ? (
    <IOSTabBar {...props} />
  ) : (
    <AndroidTabBar {...props} />
  );
}
