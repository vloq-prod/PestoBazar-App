// src/components/comman/AppNavbar.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  ChevronLeft,
  Menu,
  Search,
  ShoppingCart,
  Bell,
  Sun,
  Moon,
  TextAlignJustify,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../theme";
import { Image } from "expo-image";
import profile from "../../../assets/profile.jpeg";

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

// ─── Brand Logo ──────────────────────────────────────────────────────────────





const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 21) return "Good Evening";
  return "Good Night";
};


// ─── Icon Button ─────────────────────────────────────────────────────────────

type IconButtonProps = {
  icon: React.ReactNode;
  onPress?: () => void;
};

const IconButton: React.FC<IconButtonProps> = ({ icon, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {icon}
  </TouchableOpacity>
);

// ─── AppNavbar ────────────────────────────────────────────────────────────────

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
  const iconColor = colors.primary;
  const ICON_SIZE = 24;

  return (
    <View className="px-4 py-2 flex flex-row justify-between items-center">
      {/* ── LEFT ── */}
      <View className="flex flex-row items-center  gap-2"
      >
        {showBack && !showMenu && (
          <IconButton
            onPress={() => router.back()}
            icon={<ChevronLeft size={ICON_SIZE} color={colors.primary} />}
          />
        )}

        {showMenu && !showBack && (
          <IconButton
            onPress={onMenuPress}
            icon={<TextAlignJustify size={ICON_SIZE} color={colors.text} />}
          />
        )}

        {showLogo ? (
          <View className="flex flex-row gap-3">
            <View
              className="w-12 h-12 rounded-full border items-center justify-center overflow-hidden"
              style={{ borderColor: colors.border }}
            >
              <Image
                source={profile}
                contentFit="cover"
                style={{ width: "100%", height: "100%" }}
              />
            </View>

            <View>
             <Text className="text-md">{getGreeting()}</Text>
              <Text
                className="font-bold"
                style={{ color: colors.primary, fontSize: 20, lineHeight: 20 }}
              >
                Guest
              </Text>
            </View>
          </View>
        ) : (
          <Text style={{ fontSize: 17, fontWeight: "600", color: colors.text }}>
            {title}
          </Text>
        )}
      </View>

      {/* ── RIGHT ── */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        {rightComponent ?? (
          <>
            {showSearch && (
              <IconButton
                onPress={onSearchPress}
                icon={<Search size={ICON_SIZE} color={iconColor} />}
              />
            )}

            {showCart && (
              <IconButton
                onPress={onCartPress}
                icon={<ShoppingCart size={ICON_SIZE} color={iconColor} />}
              />
            )}

            {showNotification && (
              <IconButton
                onPress={onNotificationPress}
                icon={<Bell size={ICON_SIZE} color={iconColor} />}
              />
            )}

            {showThemeToggle && (
              <IconButton
                onPress={toggleTheme}
                icon={
                  isDark ? (
                    <Sun size={ICON_SIZE} color={iconColor} />
                  ) : (
                    <Moon size={ICON_SIZE} color={iconColor} />
                  )
                }
              />
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default AppNavbar;