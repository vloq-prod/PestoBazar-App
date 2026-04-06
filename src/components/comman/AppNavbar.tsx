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
import { useResponsive } from "../../utils/useResponsive";

const AppNavbar = ({
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
}: any) => {
  const router = useRouter();
  const { colors, toggleTheme, isDark } = useTheme();
  const { spacing, font } = useResponsive();

  const ICON_SIZE = spacing(20);
  const ICON_BOX = spacing(36);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing(12),
        paddingVertical: spacing(8),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      {/* LEFT */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing(6) }}>
        
        {showBack && !showMenu && (
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: ICON_BOX,
              height: ICON_BOX,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft size={ICON_SIZE} color={colors.text} />
          </TouchableOpacity>
        )}

        {showMenu && !showBack && (
          <TouchableOpacity
            onPress={onMenuPress}
            style={{
              width: ICON_BOX,
              height: ICON_BOX,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TextAlignJustify size={ICON_SIZE} color={colors.text} />
          </TouchableOpacity>
        )}

        {!!title && (
          <Text
            style={{
              fontSize: font(16),
              fontWeight: "700",
              color: colors.text,
            }}
          >
            {title}
          </Text>
        )}
      </View>

      {/* RIGHT */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing(4) }}>
        {rightComponent ?? (
          <>
            {showSearch && (
              <TouchableOpacity
                onPress={() =>
                  onSearchPress ? onSearchPress() : router.push("/search")
                }
                style={{
                  width: ICON_BOX,
                  height: ICON_BOX,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Search size={ICON_SIZE} color={colors.text} />
              </TouchableOpacity>
            )}

            {showCart && (
              <TouchableOpacity
                onPress={onCartPress}
                style={{
                  width: ICON_BOX,
                  height: ICON_BOX,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShoppingCart size={ICON_SIZE} color={colors.text} />
              </TouchableOpacity>
            )}

            {showNotification && (
              <TouchableOpacity
                onPress={onNotificationPress}
                style={{
                  width: ICON_BOX,
                  height: ICON_BOX,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bell size={ICON_SIZE} color={colors.text} />
              </TouchableOpacity>
            )}

            {showThemeToggle && (
              <TouchableOpacity
                onPress={toggleTheme}
                style={{
                  width: ICON_BOX,
                  height: ICON_BOX,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isDark ? (
                  <Sun size={ICON_SIZE} color={colors.text} />
                ) : (
                  <Moon size={ICON_SIZE} color={colors.text} />
                )}
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default AppNavbar;