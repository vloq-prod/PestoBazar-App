import { useCallback, useEffect } from "react";
import { Platform, Pressable, View } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Home, LayoutGrid, Store, User } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
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

const TIMING_CFG = {
  duration: 220,
  easing: Easing.out(Easing.quad),
} as const;

// ── TabItem ───────────────────────────────────────────────
function TabItem({
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
  const progress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isFocused ? 1 : 0, TIMING_CFG);
  }, [isFocused, progress]);

  const cfg = TAB_CONFIG[routeName] ?? FALLBACK_CFG;
  const iconColor = isFocused ? activeColor : inactiveColor;

  const borderStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scaleX: progress.value }],
  }));

  const labelColor = isFocused ? activeColor : inactiveColor;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      android_ripple={null}
      className="flex-1 items-center justify-center pt-2.5 pb-1.5 gap-1"
    >
      <Animated.View
        className="absolute top-0 h-[2.5px] rounded-b-sm"
        style={[
          {
            left: "10%",
            right: "10%",
            backgroundColor: activeColor,
          },
          borderStyle,
        ]}
      />

      {/* Icon */}
      <cfg.Icon size={22} color={iconColor} />

      <Animated.Text
        numberOfLines={1}
        className="text-[10px] text-center leading-[14px]"
        style={{
          fontFamily: "Poppins_500Medium",
          color: labelColor,
        }}
      >
        {cfg.label}
      </Animated.Text>
    </Pressable>
  );
}

// ── TabBar ────────────────────────────────────────────────
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const handlePress = useCallback(
    (routeKey: string, routeName: string, isFocused: boolean) => {
      const event = navigation.emit({
        type: "tabPress",
        target: routeKey,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(routeName);
      }
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
        paddingBottom: insets.bottom || (Platform.OS === "android" ? 10 : 0),
      }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        return (
          <TabItem
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
