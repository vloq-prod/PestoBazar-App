// src/components/comman/AppNavbar.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  ChevronLeft,
  Search,
  ShoppingCart,
  Bell,
  Sun,
  Moon,
  TextAlignJustify,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../theme";

type NavbarProps = {
  title?: string;
  showBack?: boolean;
  showMenu?: boolean;
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

const AppNavbar: React.FC<NavbarProps> = ({
  title = "",
  showBack = false,
  showMenu = false,
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
  const ICON_SIZE = 24;
  const ICON_COLOR = colors.text;

  return (
    <View className="px-4 py-2 flex flex-row justify-between items-center">
      {/* ── LEFT ── */}
      <View className="flex flex-row items-center gap-2">
        {showBack && !showMenu && (
          <IconButton
            onPress={() => router.back()}
            icon={<ChevronLeft size={ICON_SIZE} color={ICON_COLOR} />}
          />
        )}

        {showMenu && !showBack && (
          <IconButton
            onPress={onMenuPress}
            icon={<TextAlignJustify size={ICON_SIZE} color={ICON_COLOR} />}
          />
        )}

        {title ? (
          <Text style={{ fontSize: 17, fontWeight: "700", color: ICON_COLOR }}>
            {title}
          </Text>
        ) : null}
      </View>

      {/* ── RIGHT ── */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        {rightComponent ?? (
          <>
            {showSearch && (
              <IconButton
                onPress={onSearchPress}
                icon={<Search size={ICON_SIZE} color={ICON_COLOR} />}
              />
            )}
            {showCart && (
              <IconButton
                onPress={onCartPress}
                icon={<ShoppingCart size={ICON_SIZE} color={ICON_COLOR} />}
              />
            )}
            {showNotification && (
              <IconButton
                onPress={onNotificationPress}
                icon={<Bell size={ICON_SIZE} color={ICON_COLOR} />}
              />
            )}
            {showThemeToggle && (
              <IconButton
                onPress={toggleTheme}
                icon={
                  isDark ? (
                    <Sun size={ICON_SIZE} color={ICON_COLOR} />
                  ) : (
                    <Moon size={ICON_SIZE} color={ICON_COLOR} />
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