import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Bell, ShoppingCart } from "lucide-react-native";
import { Image } from "expo-image";
import profile from "../../../assets/profile.jpeg";
import { useResponsive } from "../../utils/useResponsive";
import { useTheme } from "../../theme";
import { useRouter } from "expo-router";
import { useAppVisitorStore } from "../../store/auth";
import { useCartCount } from "../../hooks/cartHooks";

type HomeNavbarProps = {
  name?: string;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  isLight?: boolean;
};

type IconButtonProps = {
  icon: React.ReactNode;
  onPress?: () => void;
};

const IconButton = ({ icon, onPress }: IconButtonProps) => {
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
};

const HomeNavbar: React.FC<HomeNavbarProps> = ({
  name = "Guest",
  onNotificationPress,
  onProfilePress,
  isLight = false,
}) => {
  const router = useRouter();
  const { font, spacing } = useResponsive();
  const { colors } = useTheme();

  const { userName, userId, visitorId } = useAppVisitorStore((state) => state);

  const { data: cartCountData } = useCartCount({
    user_id: Number(userId),
    visitor_id: visitorId || "",
  });

  const cartCount = cartCountData?.data || 0;

  const ICON_SIZE = spacing(20);
  const textColor = isLight ? colors.text : colors.textInverse;
  const subtitleColor = isLight ? colors.textSecondary : colors.textInverse;

  const handleMoveToCart = () => {
    router.push("/(stack)/cart");
  };

  return (
    <View className="flex-row justify-between items-center px-4 py-2">
      {/* LEFT */}
      <View className="flex-row items-center gap-3">
        <TouchableOpacity onPress={onProfilePress}>
          <Image
            source={profile}
            style={{
              width: spacing(45),
              height: spacing(45),
              borderRadius: spacing(22),
            }}
          />
        </TouchableOpacity>

        <View>
          <Text
            style={{
              fontSize: font(12),
              color: subtitleColor,
            }}
          >
            Welcome back 👋
          </Text>

          <Text
            style={{
              fontSize: font(18),
              color: textColor,
              fontWeight: "700",
              lineHeight: font(22),
            }}
          >
            {userName}
          </Text>
        </View>
      </View>

      {/* RIGHT */}
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={handleMoveToCart}
          style={{
            width: spacing(40),
            height: spacing(40),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View>
            <ShoppingCart size={ICON_SIZE} color={textColor} />
            {cartCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  right: -spacing(6),
                  top: -spacing(5),
                  backgroundColor: "#FF3B30", // Bright red
                  borderRadius: 10,
                  minWidth: spacing(16),
                  height: spacing(16),
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 2,
                  borderWidth: 1.5,
                  borderColor: isLight ? "#FFFFFF" : (colors.primary || "#6B21A8"),
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: font(9),
                    fontWeight: "700",
                  }}
                >
                  {cartCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <IconButton
          onPress={onNotificationPress}
          icon={<Bell size={ICON_SIZE} color={textColor} />}
        />
      </View>
    </View>
  );
};
export default React.memo(HomeNavbar);
