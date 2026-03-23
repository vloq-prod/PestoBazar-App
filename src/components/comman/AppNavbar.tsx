import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../../theme";


type NavbarProps = {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  showNotification?: boolean;
  showThemeToggle?: boolean;

  onSearchPress?: () => void;
  onNotificationPress?: () => void;

  rightComponent?: React.ReactNode;
};

const AppNavbar: React.FC<NavbarProps> = ({
  title = "",
  showBack = false,
  showSearch = false,
  showNotification = false,
  showThemeToggle = false,
  onSearchPress,
  onNotificationPress,
  rightComponent,
}) => {
  const router = useRouter();
  const { colors, toggleTheme, isDark } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center",   }}>
        {showBack && (
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 12, padding: 4, backgroundColor: colors.surface, borderRadius:10 }}
            
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
        )}

        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: colors.text,
          }}
        >
          {title}
        </Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        {rightComponent ? (
          rightComponent
        ) : (
          <>
            {showSearch && (
              <TouchableOpacity onPress={onSearchPress}>
                <Ionicons
                  name="search-outline"
                  size={22}
                  color={colors.text}
                />
              </TouchableOpacity>
            )}

            {showNotification && (
              <TouchableOpacity onPress={onNotificationPress}>
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color={colors.text}
                />
              </TouchableOpacity>
            )}

      
            {showThemeToggle && (
              <TouchableOpacity onPress={toggleTheme}>
                <Ionicons
                  name={isDark ? "sunny-outline" : "moon-outline"}
                  size={22}
                  color={colors.text}
                />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default AppNavbar;