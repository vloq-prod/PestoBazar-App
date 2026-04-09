import { useCallback, useEffect, useRef } from "react";
import { Platform, Pressable, View, LayoutChangeEvent } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Home, LayoutGrid, Store, User } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme";

type TabCfg = {
  label: string;
  Icon: React.ComponentType<{ size: number; color: string }>;
};

const TAB_CONFIG: Record<string, TabCfg> = {
  index: { label: "Home", Icon: Home },
  category: { label: "Category", Icon: LayoutGrid },
  shop: { label: "Shop", Icon: Store },
  profile: { label: "Profile", Icon: User },
};

const FALLBACK_CFG: TabCfg = { label: "", Icon: Home };

// ── iOS Spring config ─────────────────────────────────────
const SPRING_CFG = {
  damping: 18,
  stiffness: 180,
  mass: 0.8,
} as const;

// ── Android Timing config ─────────────────────────────────
const TIMING_CFG = {
  duration: 220,
  easing: Easing.out(Easing.quad),
} as const;

// ─────────────────────────────────────────────────────────
// iOS TabItem — plain, no per-item animation needed
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
// Android TabItem — top indicator bar animation
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
      className="flex-1 items-center justify-center pt-2.5 pb-1.5 gap-1"
    >
      {/* Top indicator bar */}
      <Animated.View
        className="absolute top-0 h-[2.5px] rounded-b-sm"
        style={[
          { left: "10%", right: "10%", backgroundColor: activeColor },
          borderStyle,
        ]}
      />
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
// iOS TabBar — floating pill style
// ─────────────────────────────────────────────────────────
function IOSTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomOffset = (insets.bottom || 0) + -13;
  const pillInset = 3;

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
        position: "absolute",
        left: 0,
        right: 0,
        bottom: bottomOffset,
        paddingHorizontal: 16,
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
  );
}

// ─────────────────────────────────────────────────────────
// Android TabBar — flat border-top style
// ─────────────────────────────────────────────────────────
function AndroidTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

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
      className="flex-row border-t"
      style={{
        backgroundColor: colors.tabBar,
        borderTopColor: colors.border,
        paddingBottom: insets.bottom || 10,
      }}
    >
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
