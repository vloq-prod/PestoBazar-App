import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  ChevronLeft,
  Search,
  ShoppingCart,
  Bell,
  Sun,
  Moon,
  ArrowLeft,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";

type AppNavbarProps = {
  title?: string;
  count?: string | number;
  showBack?: boolean;
  showSearch?: boolean;
  showNotification?: boolean;
  showThemeToggle?: boolean;
  showCart?: boolean;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onCartPress?: () => void;
  rightComponent?: React.ReactNode;
};

const AppNavbar = ({
  title = "",
  count,
  showBack = false,
  showSearch = false,
  showNotification = false,
  showThemeToggle = false,
  showCart = false,
  onSearchPress,
  onNotificationPress,

  rightComponent,
}: AppNavbarProps) => {
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
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {showBack && (
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: ICON_BOX,
              height: ICON_BOX,
              alignItems: "center",
              justifyContent: "center",
              marginRight: spacing(10),
            }}
          >
         
            <ArrowLeft size={ICON_SIZE} color={colors.text}  />
          </TouchableOpacity>
        )}

        {(!!title || count !== undefined) && (
          <View
            style={{
              justifyContent: "center",
              gap: spacing(0.5),
            }}
          >
            {!!title && (
              <Text
                style={{
                  fontSize: font(16),
                  lineHeight: font(20),
                  fontFamily: "Poppins_600SemiBold",
                  color: colors.text,
                }}
              >
                {title}
              </Text>
            )}

            {count !== undefined && count !== null && (
              <Text
                style={{
                  fontSize: font(10.5),
                  lineHeight: font(12),
                  fontFamily: "Poppins_500Medium",
                  letterSpacing: 0.2,
                  color: colors.textSecondary ?? colors.text,
                }}
              >
                {count === 1 ? ` ${count} Item` : `${count} Items`}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* RIGHT */}
      <View
        style={{ flexDirection: "row", alignItems: "center", gap: spacing(4) }}
      >
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
                onPress={() => router.push("/cart")}
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
