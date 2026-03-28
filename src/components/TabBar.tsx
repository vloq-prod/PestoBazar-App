// src/components/TabBar.tsx
import { useEffect } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
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
  index:    { label: "Home",     Icon: Home },
  orders:   { label: "Category", Icon: LayoutGrid },
  shop:     { label: "Shop",     Icon: Store },
  profile:  { label: "Profile",  Icon: User },
};

const DURATION = 220;
const EASING = Easing.out(Easing.quad);

function TabItem({
  route,
  isFocused,
  onPress,
  onLongPress,
}: {
  route: { name: string; key: string };
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const { colors } = useTheme();
  const progress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isFocused ? 1 : 0, {
      duration: DURATION,
      easing: EASING,
    });
  }, [isFocused]);

  const activeColor   = colors.primary;
  const inactiveColor = colors.tabBarInactive;

  const cfg = TAB_CONFIG[route.name] ?? {
    label: route.name,
    Icon: Home,
  };

  // Top border animated style
  const borderStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scaleX: progress.value }],
  }));

  // Icon & label color
  const iconColor = isFocused ? activeColor : inactiveColor;

  const labelStyle = useAnimatedStyle(() => ({
    color: isFocused ? activeColor : inactiveColor,
  }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}
      android_ripple={null}
    >
      {/* ── Top active border ── */}
      <Animated.View
        style={[
          styles.topBorder,
          { backgroundColor: activeColor },
          borderStyle,
        ]}
      />

      {/* ── Icon ── */}
      <cfg.Icon size={22} color={iconColor} />

      {/* ── Label ── */}
      <Animated.Text style={[styles.label, labelStyle]} numberOfLines={1}>
        {cfg.label}
      </Animated.Text>
    </Pressable>
  );
}

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom || (Platform.OS === "android" ? 10 : 0),
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        return (
          <TabItem
            key={route.key}
            route={route}
            isFocused={isFocused}
            onPress={() => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            onLongPress={() =>
              navigation.emit({ type: "tabLongPress", target: route.key })
            }
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    paddingBottom: 6,
    gap: 4,
  },
  topBorder: {
    position: "absolute",
    top: 0,
    left: "10%",
    right: "10%",
    height: 2.5,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  label: {
    fontSize: 10,
    fontFamily: "Poppins_500Medium",
    lineHeight: 14,
    textAlign: "center",
  },
});