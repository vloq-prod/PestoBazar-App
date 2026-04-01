import React from "react";
import { Text, View, Image, ActivityIndicator } from "react-native";
import { useTheme } from "../../theme";
import { useUsp } from "../../hooks/homeHooks";
import { UspItem } from "../../types/home.types";

// ─── Single USP Item ──────────────────────────────────────
const UspCard = ({
  item,
  colors,
  flex,
}: {
  item: UspItem;
  colors: any;
  flex: number; // 1 for row of 2, controls width
}) => (
  <View
    className="items-center justify-center rounded-2xl py-4 px-2 gap-2"
    style={{
      flex,
      backgroundColor: colors.primary + "08",
      borderWidth: 1,
      borderColor: colors.primary + "18",
    }}
  >
    {/* Image */}

    <Image source={{ uri: item.image }} className="w-14 h-14" />

    {/* Text */}
    <Text
      className="text-[11px] text-center leading-4"
      numberOfLines={2}
      style={{
        fontSize: 12,
        fontFamily: "Poppins_500Medium",
        color: colors.text,
      }}
    >
      {item.text}
    </Text>
  </View>
);

// ─── Main ────────────────────────────────────────────────
const HomeUsp = () => {
  const { colors } = useTheme();
  const { uspList, loading } = useUsp();

  if (loading) {
    return (
      <View className="h-24 justify-center items-center">
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (!uspList || uspList.length === 0) return null;

  // ✅ Row 1 → first 2 items, Row 2 → remaining (3)
  const row1 = uspList.slice(0, 2);
  const row2 = uspList.slice(2);

  return (
    <View className="gap-2.5 px-4">
      {/* ── Row 1 — 2 items ── */}
      <View className="flex-row gap-2.5">
        {row1.map((item, i) => (
          <UspCard key={i} item={item} colors={colors} flex={1} />
        ))}
      </View>

  
      {row2.length > 0 && (
        <View className="flex-row gap-2.5">
          {row2.map((item, i) => (
            <UspCard key={i} item={item} colors={colors} flex={1} />
          ))}
        </View>
      )}
    </View>
  );
};

export default HomeUsp;
