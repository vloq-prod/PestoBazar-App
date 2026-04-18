import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";

const Footer = () => {
  const { colors } = useTheme();
  const { font, scale } = useResponsive();
  return (
    <View style={{ gap: 20, height: 300 }}>
      <View
        style={{
          height: 200,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.backgroundgray,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 16,
        }}
      >
        <Text
          style={{
            fontSize: 30,
            fontFamily: "Poppins_800ExtraBold",
            color: colors.textgray,
          }}
        >
          India&apos;s Leading Online Pesticide Hub
        </Text>
      </View>
      <View style={{ paddingHorizontal: 16 }}>
        <Text
          style={{
            fontSize: 18,
            fontFamily: "Poppins_700Bold",
            color: colors.textgray,
          }}
        >
          Pestobazaar
        </Text>
      </View>
    </View>
  );
};

export default Footer;

const styles = StyleSheet.create({});
