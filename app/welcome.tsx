import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { useAppVisitorStore } from "../src/store/auth";
import { useVisitor } from "../src/hooks/useAuthHooks";
import { StorageUtil } from "../src/utils/storage";

const { width, height } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    image: require("../assets/welcome-screen/Farmer Image from Unsplash.jpg"),
    title: "Quality Pesticides\nDelivered Fast",
    subtitle: "Get certified pesticides delivered to your farm within hours.",
  },
  {
    id: "2",
    image: require("../assets/welcome-screen/Farmer Spraying Vegetables.jpg"),
    title: "Protect Your\nCrops Better",
    subtitle: "Expert-recommended solutions for every crop and season.",
  },
  {
    id: "3",
    image: require("../assets/welcome-screen/Male Agronomist Apple Trees Pesticides.jpg"),
    title: "India's Leading\nPesticide Hub",
    subtitle: "Trusted by thousands of farmers across India.",
  },
];

function Dot({
  index,
  activeIndex,
}: {
  index: number;
  activeIndex: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const isActive = Math.round(activeIndex.value) === index;
    return {
      width: withTiming(isActive ? 24 : 7, { duration: 300 }),
      opacity: withTiming(isActive ? 1 : 0.45, { duration: 300 }),
    };
  });

  return <Animated.View style={[styles.dot, style]} />;
}

export default function WelcomeScreen() {
  const visitorId = useAppVisitorStore((state) => state.visitorId);
  const { createVisitor } = useVisitor();
  const setVisitor = useAppVisitorStore((state) => state.setVisitor);

  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useSharedValue(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.value = e.nativeEvent.contentOffset.x / width;
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index != null) {
        setActiveIndex(viewableItems[0].index);
        scrollX.value = viewableItems[0].index;
      }
    },
  ).current;

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    }
  };

  const handleGetStarted = async () => {
    try {
      const res = await createVisitor({
        visitor_id: visitorId || "",
      });

      const { visitor_id, token } = res;

      setVisitor(visitor_id, token);

      await StorageUtil.setVisitor(visitor_id, token);

      router.replace("/(tabs)");
    } catch (error) {
   
    }
  };

  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={{ width, height }}>
            <Image
              source={item.image}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.85)"]}
              locations={[0.3, 0.6, 1]}
              style={StyleSheet.absoluteFill}
            />
          </View>
        )}
      />

      {/* Bottom content */}
      <View
        style={[styles.bottomContent, { paddingBottom: insets.bottom + 24 }]}
        pointerEvents="box-none"
      >
        {/* Title & subtitle — animate per active slide */}
        <View style={styles.textBlock}>
          <Text style={styles.title}>{SLIDES[activeIndex].title}</Text>
          <Text style={styles.subtitle}>{SLIDES[activeIndex].subtitle}</Text>
        </View>

        {/* Dots + Button row */}
        <View style={styles.bottomRow}>
          {/* Dots */}
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <Dot key={i} index={i} activeIndex={scrollX} />
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={styles.btn}
            onPress={isLast ? handleGetStarted : handleNext}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>
              {isLast ? "Get Started" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  bottomContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    gap: 28,
  },
  textBlock: {
    gap: 10,
  },
  title: {
    fontFamily: "Poppins_700Bold",
    fontSize: 34,
    color: "#fff",
    lineHeight: 42,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 23,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    height: 7,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  btn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  btnText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: "#fff",
  },
  image: {
    width: width,
    height: height,
  },
});
