import { useEffect } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const TAB_CONFIG: Record<string, { label: string; icon: IoniconName; iconActive: IoniconName }> = {
  index:       { label: "Home",      icon: "home-outline",           iconActive: "home" },
  shop:        { label: "Shop",      icon: "storefront-outline",     iconActive: "storefront" },
  "buy-again": { label: "Buy Again", icon: "refresh-circle-outline", iconActive: "refresh-circle" },
  orders:      { label: "Orders",    icon: "receipt-outline",        iconActive: "receipt" },
  profile:     { label: "Profile",   icon: "person-outline",         iconActive: "person" },
};

const DURATION = 200;
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
    progress.value = withTiming(isFocused ? 1 : 0, { duration: DURATION, easing: EASING });
  }, [isFocused]);

  const activeColor = colors.primary;
  const inactiveColor = colors.tabBarInactive;

  // Animate icon color via opacity layering: inactive icon fades out, active fades in
  const activeIconStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const inactiveIconStyle = useAnimatedStyle(() => ({ opacity: 1 - progress.value }));

  const labelActiveStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const labelInactiveStyle = useAnimatedStyle(() => ({ opacity: 1 - progress.value }));

  const cfg = TAB_CONFIG[route.name] ?? { label: route.name, icon: "ellipse-outline", iconActive: "ellipse" };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}
      android_ripple={null}
    >
      {/* Icon layer */}
      <View style={styles.iconContainer}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.iconCenter, inactiveIconStyle]}>
          <Ionicons name={cfg.icon} size={22} color={inactiveColor} />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, styles.iconCenter, activeIconStyle]}>
          <Ionicons name={cfg.iconActive} size={22} color={activeColor} />
        </Animated.View>
      </View>

      {/* Label layer */}
      <View style={styles.labelContainer}>
        <Animated.Text style={[styles.label, { color: inactiveColor }, labelInactiveStyle]} numberOfLines={1}>
          {cfg.label}
        </Animated.Text>
        <Animated.Text style={[styles.label, { color: activeColor }, StyleSheet.absoluteFill, labelActiveStyle]} numberOfLines={1}>
          {cfg.label}
        </Animated.Text>
      </View>
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
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    gap: 4,
  },
  iconContainer: {
    width: 24,
    height: 24,
  },
  iconCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  labelContainer: {
    position: "relative",
    alignItems: "center",
  },
  label: {
    fontSize: 10,
    fontFamily: "Poppins_500Medium",
    lineHeight: 14,
    textAlign: "center",
  },
});
