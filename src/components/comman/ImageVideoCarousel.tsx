import React, { useCallback, useRef, useState } from "react";
import {
  View,
  FlatList,
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useTheme } from "../../theme";
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Play } from "lucide-react-native";
import MediaLightbox from "./MediaLightbox";

const { width } = Dimensions.get("window");
const CAROUSEL_HEIGHT = width;

type MediaItem = {
  type: "image" | "video";
  image?: string | null;
  video?: string | null;
};

// ─── Video Item ───────────────────────────────────────────────
const VideoItem = ({
  uri,
  shouldPlay,
}: {
  uri: string;
  shouldPlay: boolean;
}) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
  });

  React.useEffect(() => {
    if (!player) return;
    if (shouldPlay) player.play();
    else {
      player.pause();
      player.currentTime = 0;
    }
  }, [shouldPlay, player]);

  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFillObject}
      nativeControls
      contentFit="contain"
    />
  );
};

// ─── Dot ─────────────────────────────────────────────────────
const CarouselDot = ({
  isActive,
  isVideo,
  activeColor,
}: {
  isActive: boolean;
  isVideo: boolean;
  activeColor: string;
}) => {
  const animStyle = useAnimatedStyle(() => ({
    width: withTiming(isActive ? (isVideo ? 28 : 20) : 7, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    }),
    opacity: withTiming(isActive ? 1 : 0.35, { duration: 250 }),
    backgroundColor: withTiming(isActive ? activeColor : "#fff", {
      duration: 250,
    }),
  }));

  return (
    <Animated.View style={[styles.dot, animStyle]}>
      {isVideo && isActive && <Play size={7} color="#fff" fill="#fff" />}
    </Animated.View>
  );
};

// ─── Main ─────────────────────────────────────────────────────
const ImageVideoCarousel: React.FC<{ data: MediaItem[] }> = ({ data }) => {
  const { colors } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 51 });

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index ?? 0);
  }, []);

  // console.log("iamges data: ", data)

  if (!data || data.length === 0) return null;

  return (
    <>
      <View style={styles.root}>
        <FlatList
          data={data}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig.current}
          decelerationRate="fast"
          renderItem={({ item, index }) => (
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={() => {
                setLightboxIndex(index);
                setLightboxOpen(true);
              }}
              style={styles.slide}
            >
              {item.type === "image" ? (
                <Image
                  source={{ uri: item.image! }}
                  style={StyleSheet.absoluteFillObject}
                  resizeMode="cover"
                />
              ) : (
                <VideoItem
                  uri={item.video!}
                  shouldPlay={activeIndex === index}
                />
              )}
            </TouchableOpacity>
          )}
        />

        {/* ── Dots only ── */}
        {data.length > 1 && (
          <View style={styles.dotsContainer}>
            <View style={styles.dotsPill}>
              {data.map((item, i) => (
                <CarouselDot
                  key={i}
                  isActive={activeIndex === i}
                  isVideo={item.type === "video"}
                  activeColor={colors.primary}
                />
              ))}
            </View>
          </View>
        )}
      </View>

      <MediaLightbox
        data={data}
        initialIndex={lightboxIndex}
        visible={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        accentColor={colors.primary}
      />
    </>
  );
};

export default ImageVideoCarousel;

const styles = StyleSheet.create({
  root: {
    width,
    height: CAROUSEL_HEIGHT,
  },
  slide: {
    width,
    height: CAROUSEL_HEIGHT,
  },
  dotsContainer: {
    position: "absolute",
    bottom: 14,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  dotsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "black",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  dot: {
    height: 7,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
