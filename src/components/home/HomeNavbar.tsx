// src/components/home/HomeNavbar.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ShoppingCart, Bell, Menu } from "lucide-react-native";
import { Image } from "expo-image";
import profile from "../../../assets/profile.jpeg";

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

const IconButton: React.FC<IconButtonProps> = ({ icon, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {icon}
  </TouchableOpacity>
);

const HomeNavbar: React.FC<HomeNavbarProps> = ({
  name = "Guest",
  onMenuPress,
  onCartPress,
  onNotificationPress,
  onProfilePress,
}) => {
  const ICON_SIZE = 24;
  const ICON_COLOR = "#ffffff";

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
      }}
    >
      {/* ── LEFT: Menu + Profile + Welcome ── */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <IconButton
          onPress={onMenuPress}
          icon={<Menu size={ICON_SIZE} color={ICON_COLOR} />}
        />

        <TouchableOpacity
          onPress={onProfilePress}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            borderWidth: 2,
            borderColor: "rgba(255,255,255,0.6)",
            overflow: "hidden",
          }}
        >
          <Image
            source={profile}
            contentFit="cover"
            style={{ width: "100%", height: "100%" }}
          />
        </TouchableOpacity>

        <View>
          <Text
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.75)",
              fontWeight: "400",
            }}
          >
            Welcome back 👋
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: "#ffffff",
              lineHeight: 22,
            }}
          >
            {name}
          </Text>
        </View>
      </View>

      {/* ── RIGHT: Cart + Notification ── */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <IconButton
          onPress={onCartPress}
          icon={<ShoppingCart size={ICON_SIZE} color={ICON_COLOR} />}
        />
        <IconButton
          onPress={onNotificationPress}
          icon={<Bell size={ICON_SIZE} color={ICON_COLOR} />}
        />
      </View>
    </View>
  );
};

export default HomeNavbar;