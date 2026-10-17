import React, { useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, BackHandler } from "react-native";
import {
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
  subtitle?: string;
  count?: string | number;
  showBack?: boolean;
  showSearch?: boolean;
  showNotification?: boolean;
  showThemeToggle?: boolean;
  showCart?: boolean;
  hideBorder?: boolean;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onCartPress?: () => void;
  rightComponent?: React.ReactNode;
};

const formatBrandTitle = (text?: string): string => {
  if (!text || typeof text !== "string") return text || "";
  return text.replace(/\b[pP]esto\s*[bB]aza[ar]*\b/gi, "Pestobazaar");
};

const AppNavbar = ({
  title = "",
  subtitle,
  count,
  showBack = false,
  showSearch = false,
  showNotification = false,
  showThemeToggle = false,
  showCart = false,
  hideBorder = false,
  onSearchPress,
  onNotificationPress,

  rightComponent,
}: AppNavbarProps) => {
  const router = useRouter();
  const { colors, toggleTheme, isDark } = useTheme();
  const { spacing, font } = useResponsive();

  const displayTitle = formatBrandTitle(title);
  const displaySubtitle = formatBrandTitle(subtitle);

  const ICON_SIZE = spacing(20);
  const ICON_BOX = spacing(36);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  }, [router]);

  useEffect(() => {
    if (!showBack) return;

    const onBackPress = () => {
      handleBack();
      return true;
    };

    const backSub = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );
    return () => backSub.remove();
  }, [showBack, handleBack]);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing(12),
        paddingVertical: spacing(8),
        borderBottomWidth: hideBorder ? 0 : 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.background
      }}
    >
      {/* LEFT */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          flex: 1,
          marginRight: spacing(8),
        }}
      >
        {showBack && (
          <TouchableOpacity
            onPress={handleBack}
            style={{
              width: ICON_BOX,
              height: ICON_BOX,
              alignItems: "center",
              justifyContent: "center",
              marginRight: spacing(8),
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={ICON_SIZE} color={colors.text} />
          </TouchableOpacity>
        )}

        {(!!title || !!subtitle || count !== undefined) && (
          <View
            style={{
              justifyContent: "center",
              gap: spacing(0.5),
              flex: 1,
            }}
          >
            {!!displayTitle && (
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  fontSize: font(16),
                  lineHeight: font(20),
                  fontFamily: "Poppins_600SemiBold",
                  color: colors.text,
                }}
              >
                {displayTitle}
              </Text>
            )}

            {!!displaySubtitle ? (
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  fontSize: font(10.5),
                  lineHeight: font(12),
                  fontFamily: "Poppins_500Medium",
                  letterSpacing: 0.2,
                  color: colors.textSecondary ?? colors.text,
                }}
              >
                {displaySubtitle}
              </Text>
            ) : count !== undefined && count !== null ? (
              <Text
                numberOfLines={1}
                style={{
                  fontSize: font(10.5),
                  lineHeight: font(12),
                  fontFamily: "Poppins_500Medium",
                  letterSpacing: 0.2,
                  color: colors.textSecondary ?? colors.text,
                }}
              >
                {count === 1 ? `${count} Item` : `${count} Items`}
              </Text>
            ) : null}
          </View>
        )}
      </View>

      {/* RIGHT */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing(4),
          flexShrink: 0,
        }}
      >
        {rightComponent ?? (
          <>
            {showSearch && (
              <TouchableOpacity
                onPress={() =>
                  onSearchPress ? onSearchPress() : router.push("/shop")
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
