import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Menu } from "lucide-react-native";
import { useTheme } from "../../theme";
import { useRouter } from "expo-router";
import { useResponsive } from "../../utils/useResponsive";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from "react-native-reanimated";

const SEARCH_HINTS = [
  "Rat Control",
  "Mosquito Control",
  "Termite Control",
  "Fly Control",
  "Ant Control",
  "Cockroach Control",
  "Lizard Control",
  "Bed Bugs Control",
  "Snake Control",
];

const CHAR_DELAY = 60;
const ERASE_DELAY = 40;
const PAUSE = 1200;

export default function AppSearchBar({ onPress }: any) {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const router = useRouter();

  const [hintIndex, setHintIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "erasing">("typing");

  const text = SEARCH_HINTS[hintIndex];
  const characters = text.split("");

  useEffect(() => {
    setPhase("typing");
  }, [hintIndex]);

  useEffect(() => {
    let t: any;

    if (phase === "typing") {
      t = setTimeout(
        () => {
          setPhase("erasing");
        },
        text.length * CHAR_DELAY + PAUSE,
      );
    } else {
      t = setTimeout(
        () => {
          setHintIndex((prev) => (prev + 1) % SEARCH_HINTS.length);
        },
        text.length * ERASE_DELAY + 200,
      );
    }

    return () => clearTimeout(t);
  }, [phase, text]);

  const HEIGHT = spacing(38);

  return (
    <View className="flex-row items-center gap-3">
      {/* Menu */}
      <View
        style={{
          height: HEIGHT,
          width: HEIGHT,
          borderRadius: spacing(12),
          backgroundColor: colors.surface,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Menu size={spacing(18)} color={colors.primary} />
      </View>

      {/* Search Bar */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => (onPress ? onPress() : router.push("/search"))}
        className="flex-1 flex-row items-center rounded-xl border"
        style={{
          height: HEIGHT,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          paddingHorizontal: spacing(12),
        }}
      >
        <Feather name="search" size={spacing(16)} color={colors.primary} />

        <View className="flex-row items-center flex-1 ml-2">
          <Text
            style={{
              fontSize: font(12),
              color: colors.textTertiary,
            }}
          >
            Search by{" "}
          </Text>

          {/* Animated Text */}
          <View className="flex-row">
            {characters.map((char, index) => (
              <FadeChar
                key={`${char}-${index}`}
                char={char}
                index={index}
                totalLength={characters.length}
                phase={phase}
              
              />
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

//
// ✅ SAFE child component (hooks allowed here)
//
const FadeChar = (({ char, index, totalLength, phase }: any) => {
  const { font } = useResponsive();
  const { colors } = useTheme();

  const opacity = useSharedValue(0);

  useEffect(() => {
    if (phase === "typing") {
      opacity.value = withDelay(
        index * CHAR_DELAY,
        withTiming(1, { duration: 200 }),
      );
    } else {
      const reverseIndex = totalLength - index - 1;

      opacity.value = withDelay(
        reverseIndex * ERASE_DELAY,
        withTiming(0, { duration: 150 }),
      );
    }
  }, [index, opacity, phase, totalLength]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.Text
      style={[
        {
          fontSize: font(12),
          color: colors.primary,
          fontWeight: "700",
        },
        animatedStyle,
      ]}
    >
      {char}
    </Animated.Text>
  );
});
