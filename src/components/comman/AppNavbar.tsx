// src/components/comman/AppNavbar.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../../theme";

type NavbarProps = {
  title?: string;
  showBack?: boolean;
  showMenu?: boolean;
  showLogo?: boolean;
  showSearch?: boolean;
  showNotification?: boolean;
  showThemeToggle?: boolean;
  showCart?: boolean;
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onCartPress?: () => void;
  rightComponent?: React.ReactNode;
};

const START_COLOR = { r: 74, g: 50, b: 128 };
const END_COLOR   = { r: 225, g: 3, b: 32 };
const LOGO_TEXT   = "PestoBazaar";

const interpolateColor = (start: typeof START_COLOR, end: typeof START_COLOR, t: number) => {
  const r = Math.round(start.r + (end.r - start.r) * t);
  const g = Math.round(start.g + (end.g - start.g) * t);
  const b = Math.round(start.b + (end.b - start.b) * t);
  return `rgb(${r},${g},${b})`;
};

const BRAND_COLORS = LOGO_TEXT.split("").map((_, i) =>
  interpolateColor(START_COLOR, END_COLOR, i / (LOGO_TEXT.length - 1))
);

const LogoText = () => (
  <Text style={{ fontSize: 20, fontWeight: "700", letterSpacing: -0.3, lineHeight: 24 }}>
    {LOGO_TEXT.split("").map((char, i) => (
      <Text key={i} style={{ color: BRAND_COLORS[i] }}>
        {char}
      </Text>
    ))}
  </Text>
);

const IconButton = ({
  name,
  onPress,
  color,
}: {
  name: any;
  onPress?: () => void;
  color: string;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}
  >
    <Ionicons name={name} size={22} color={color} />
  </TouchableOpacity>
);

const AppNavbar: React.FC<NavbarProps> = ({
  title = "",
  showBack = false,
  showMenu = false,
  showLogo = false,
  showSearch = false,
  showNotification = false,
  showThemeToggle = false,
  showCart = false,
  onMenuPress,
  onSearchPress,
  onNotificationPress,
  onCartPress,
  rightComponent,
}) => {
  const router = useRouter();
  const { colors, toggleTheme, isDark } = useTheme();
  const iconColor = colors.text;

  return (
    <View
      className="px-4 py-2 flex flex-row justify-between items-center"
    >
      {/* LEFT */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {showBack && !showMenu && (
          <IconButton
            name="chevron-back"
            onPress={() => router.back()}
            color={BRAND_COLORS[0]}
          />
        )}
        {showMenu && !showBack && (
          <IconButton name="menu-outline" onPress={onMenuPress} color={iconColor} />
        )}

        {showLogo ? (
          <LogoText />
        ) : (
          <Text style={{ fontSize: 17, fontWeight: "600", color: colors.text }}>
            {title}
          </Text>
        )}
      </View>

      {/* RIGHT */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        {rightComponent ?? (
          <>
            {showSearch && (
              <IconButton name="search-outline" onPress={onSearchPress} color={iconColor} />
            )}
            {showCart && (
              <IconButton name="cart-outline" onPress={onCartPress} color={iconColor} />
            )}
            {showNotification && (
              <IconButton name="notifications-outline" onPress={onNotificationPress} color={iconColor} />
            )}
            {showThemeToggle && (
              <IconButton
                name={isDark ? "sunny-outline" : "moon-outline"}
                onPress={toggleTheme}
                color={iconColor}
              />
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default AppNavbar;