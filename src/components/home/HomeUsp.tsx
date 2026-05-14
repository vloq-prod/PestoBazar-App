import React from "react";
import { Text, View, Image, ActivityIndicator, StyleSheet, ScrollView, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { useUsp } from "../../hooks/homeHooks";
import { UspItem } from "../../types/home.types";
import GradientDivider from "../common/GradientDivider";

const TECHNICAL_ICON = require("../../../assets/usp/Technical.png");
const GENUINE_ICON = require("../../../assets/usp/Genuine.png");
const VERIFIED_ICON = require("../../../assets/usp/Verified.png");
const PROTECTION_ICON = require("../../../assets/usp/Protection.png");
const TRUSTED_ICON = require("../../../assets/usp/Trusted.png");

const USP_IMAGE_MAP: { [key: string]: any } = {
  "Dedicated Technical Support": TECHNICAL_ICON,
  "100% Genuine Product": GENUINE_ICON,
  "Verified Seller": VERIFIED_ICON,
  "Buyer Protection": PROTECTION_ICON,
  "Trusted Delivery": TRUSTED_ICON,
};

// ─── UspCard ──────────────────────────────────────────────────────────────────

interface UspCardProps {
  item: UspItem;
  width: number;
  index: number;
}

const UspCard: React.FC<UspCardProps> = ({ item, width, index }) => {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();

  return (
    <View
      style={[
        styles.card,
        {
          width: width,
          backgroundColor: colors.surface,
          borderTopLeftRadius: width / 2,
          borderTopRightRadius: width / 2,
          borderBottomLeftRadius: spacing(4),
          borderBottomRightRadius: spacing(4),
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing(8),
          alignItems: "center",
        },
      ]}
    >
      {/* Premium Reflective Gradient */}
      <LinearGradient
        colors={["rgba(255,255,255,0.08)", "transparent", "rgba(0,0,0,0.05)"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Icon/Image Container */}
      <View
        style={{
          width: spacing(58),
          height: spacing(58),
          borderRadius: spacing(29),
          alignItems: "center",
          justifyContent: "center",
          marginBottom: spacing(10),
          marginTop: spacing(6),
       
        }}
      >
        <Image
          source={USP_IMAGE_MAP[item.text] || { uri: item.image }}
          style={{ width: spacing(65), height: spacing(45) }}
          resizeMode="contain"
        />
      </View>

      {/* Text */}
      <Text
        numberOfLines={2}
        style={{
          fontFamily: "Poppins_600SemiBold",
          fontSize: font(9),
          color: colors.text,
          textAlign: "center",
          lineHeight: font(12),
          paddingHorizontal: spacing(2),
        }}
      >
        {item.text}
      </Text>
    </View>
  );
};

// ─── HomeUsp ──────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const HomeUsp: React.FC = () => {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();
  const { uspList, loading } = useUsp();

  const EDGE_PADDING = spacing(16);
  const GAP = spacing(12);
  const VISIBLE_ITEMS = 3.3; // Show 3 full items and part of the 4th

  const CARD_WIDTH =
    (SCREEN_WIDTH - EDGE_PADDING * 2 - GAP * Math.floor(VISIBLE_ITEMS)) /
    VISIBLE_ITEMS;

  if (loading) {
    return (
      <View style={[styles.placeholder, { height: spacing(96) }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (!uspList || uspList.length === 0) return null;

  return (
    <View
      style={[
        styles.section,
        {
          gap: spacing(18),
        },
      ]}
    >
      {/* ── Header ── */}
      <View style={{ paddingHorizontal: EDGE_PADDING }}>
        <GradientDivider
          label="Why customers love us"
          colors={colors}
          font={font}
          spacing={spacing}
          marginTop={0}
          fontSize={font(16)}
          textColor={colors.text}
          fontFamily="Poppins_700Bold"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + GAP}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: EDGE_PADDING,
          gap: GAP,
          paddingBottom: spacing(4),
        }}
      >
        {uspList.map((item, i) => (
          <UspCard key={i} item={item} width={CARD_WIDTH} index={i} />
        ))}
      </ScrollView>
    </View>
  );
};

export default HomeUsp;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {},
  header: {
    alignItems: "center",
  },
  grid: {
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
  },
  card: {
    overflow: "hidden",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
});
