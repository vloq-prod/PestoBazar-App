import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ShoppingCart, Bell } from "lucide-react-native";
import { Image } from "expo-image";
import profile from "../../../assets/profile.jpeg";
import { useResponsive } from "../../utils/useResponsive";
import { useTheme } from "../../theme";

type HomeNavbarProps = {
  name?: string;
  onMenuPress?: () => void;
  onCartPress?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
};

type IconButtonProps = {
  icon: React.ReactNode;
  onPress?: () => void;
};

const IconButton = (({ icon, onPress }: IconButtonProps) => {
  const { spacing } = useResponsive();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: spacing(38),
        height: spacing(38),
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </TouchableOpacity>
  );
});

const HomeNavbar: React.FC<HomeNavbarProps> = ({
  name = "Guest",
  onCartPress,
  onNotificationPress,
  onProfilePress,
}) => {
  const { font, spacing } = useResponsive();
  const { colors } = useTheme();

  const ICON_SIZE = spacing(20);

  return (
    <View className="flex-row justify-between items-center px-4 py-2">
      {/* LEFT */}
      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          onPress={onProfilePress}
          style={{
            width: spacing(44),
            height: spacing(44),
            borderRadius: spacing(22),
            borderWidth: 2,
            borderColor: colors.borderStrong,
            overflow: "hidden",
          }}
        >
          <Image source={profile} style={{ width: "100%", height: "100%" }} />
        </TouchableOpacity>

        <View>
          <Text
            style={{
              fontSize: font(12),
              color: colors.textInverse,
            }}
          >
            Welcome back 👋
          </Text>

          <Text
            style={{
              fontSize: font(18),
              color: colors.textInverse,
              fontWeight: "700",
              lineHeight: font(22),
            }}
          >
            {name}
          </Text>
        </View>
      </View>

      {/* RIGHT */}
      <View className="flex-row items-center">
        <IconButton
          onPress={onCartPress}
          icon={
            <ShoppingCart
              size={ICON_SIZE}
              color={colors.textInverse} 
            />
          }
        />
        <IconButton
          onPress={onNotificationPress}
          icon={
            <Bell
              size={ICON_SIZE}
              color={colors.textInverse} 
            />
          }
        />
      </View>
    </View>
  );
};
export default React.memo(HomeNavbar);
