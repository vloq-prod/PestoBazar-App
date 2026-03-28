// src/components/home/MiniCart.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ShoppingCart, ArrowRight } from "lucide-react-native";
import { useTheme } from "../../theme";

const MiniCart = () => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 12,
        right: 12,
        marginBottom: 10,
        zIndex: 99,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        style={{
          backgroundColor: colors.primary,
          borderRadius: 10,
          paddingHorizontal: 10,
          paddingVertical: 6,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        {/* ── LEFT ── */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 35,
              height: 35,
              borderRadius: 10,
              backgroundColor: "rgba(255,255,255,0.15)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShoppingCart size={18} color={colors.primaryForeground} strokeWidth={2} />
          </View>

          <View style={{ gap: 1 }}>
            <Text
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 11,
                fontFamily: "Poppins_400Regular",
              }}
            >
              3 items in cart
            </Text>
            <Text
              style={{
                color: colors.primaryForeground,
                fontSize: 15,
                fontFamily: "Poppins_600SemiBold",
                lineHeight: 20,
              }}
            >
              ₹ 1,248
            </Text>
          </View>
        </View>

        {/* ── RIGHT ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: colors.background, 
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 10,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Poppins_500Medium",
            }}
          >
            View Cart
          </Text>
          <ArrowRight size={14}  strokeWidth={2.5} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default MiniCart;