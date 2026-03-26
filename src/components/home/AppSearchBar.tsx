import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { useTheme } from "../../theme";

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

interface Props {
  onPress?: () => void;
}

export default function AppSearchBar({ onPress }: Props) {
  const { colors } = useTheme();

  const [hintIndex, setHintIndex] = useState(0);
  const [displayText, setDisplayText] = useState(SEARCH_HINTS[0]);
  const [phase, setPhase] = useState<"typing" | "erasing">("typing");

  const text = SEARCH_HINTS[hintIndex];

  useEffect(() => {
    setDisplayText(text);
    setPhase("typing");
  }, [hintIndex]);

  useEffect(() => {
    if (phase === "typing") {
      const t = setTimeout(() => {
        setPhase("erasing");
      }, text.length * CHAR_DELAY + PAUSE);
      return () => clearTimeout(t);
    }

    if (phase === "erasing") {
      const t = setTimeout(() => {
        setHintIndex((prev) => (prev + 1) % SEARCH_HINTS.length);
      }, text.length * ERASE_DELAY + 200);
      return () => clearTimeout(t);
    }
  }, [phase]);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="flex-row items-center rounded-full px-4 py-3 border"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}
    >
      <Feather name="search" size={18} color={colors.primary} />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginLeft: 8,
          flex: 1,
          flexWrap: "nowrap",
        }}
      >
        <Text style={{ fontSize: 14, color: colors.textTertiary }}>
          Search by {" "}
        </Text>

        <View style={{ flexDirection: "row" }}>
          {displayText.split("").map((char, index) => {
            return (
              <FadeChar
                key={index}
                char={char}
                index={index}
                totalLength={displayText.length}
                phase={phase}
                colors={colors}
              />
            );
          })}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function FadeChar({
  char,
  index,
  totalLength,
  phase,
  colors,
}: any) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (phase === "typing") {
      opacity.value = withDelay(
        index * CHAR_DELAY,
        withTiming(1, { duration: 200 })
      );
    } else {
      // reverse order for erase
      const reverseIndex = totalLength - index - 1;

      opacity.value = withDelay(
        reverseIndex * ERASE_DELAY,
        withTiming(0, { duration: 150 })
      );
    }
  }, [phase]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.Text
      style={[
        {
          fontSize: 14,
          color: colors.primary,
          fontWeight: "500",
        },
        style,
      ]}
    >
      {char}
    </Animated.Text>
  );
}