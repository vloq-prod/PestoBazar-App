import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text,
  Pressable,
  AppState,
  type AppStateStatus,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import { useTheme } from "../../theme";
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import {
  Play,
  Pause,
  Maximize2,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
} from "lucide-react-native";
import ProductMediaLightbox from "./ProductMediaLightbox";

const { width } = Dimensions.get("window");
const CAROUSEL_HEIGHT = width;

type MediaItem = {
  type: "image" | "video";
  image?: string | null;
  video?: string | null;
};

// ─── Inline Video Item for Product Details Carousel ───────────
const VideoItem = ({
  uri,
  shouldPlay,
  accentColor = "#22C55E",
  onOpenLightbox,
}: {
  uri: string;
  shouldPlay: boolean;
  accentColor?: string;
  onOpenLightbox: () => void;
}) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.preservesPitch = true;
    p.timeUpdateEventInterval = 0.25;
  });

  const playingEvent = useEvent(player, "playingChange");
  const isPlaying = playingEvent?.isPlaying ?? player.playing;

  const timeEvent = useEvent(player, "timeUpdate");
  const currentTime = timeEvent?.currentTime ?? player.currentTime;

  const mutedEvent = useEvent(player, "mutedChange");
  const isMuted = mutedEvent?.muted ?? player.muted;

  const [showControls, setShowControls] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubRatio, setScrubRatio] = useState(0);
  const [trackWidth, setTrackWidth] = useState(width);
  const dragStartRef = useRef<{ startX: number; startPageX: number }>({
    startX: 0,
    startPageX: 0,
  });
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const duration = player.duration || 0;
  const effectiveTime = isScrubbing ? scrubRatio * duration : currentTime;
  const progressPercent =
    duration > 0
      ? Math.min(100, Math.max(0, (effectiveTime / duration) * 100))
      : 0;

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }
    if (isPlaying) {
      controlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      resetControlsTimeout();
    } else {
      setShowControls(true);
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    }
    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, [isPlaying, resetControlsTimeout]);

  const userPausedRef = useRef(false);

  useEffect(() => {
    if (!player) return;
    if (shouldPlay) {
      if (!userPausedRef.current) {
        player.play();
      }
    } else {
      player.pause();
    }
  }, [shouldPlay, player]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        player?.pause();
      } catch {}
    };
  }, [player]);

  const toggleControls = () => {
    setShowControls((prev) => {
      const next = !prev;
      if (next && isPlaying) {
        resetControlsTimeout();
      }
      return next;
    });
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      userPausedRef.current = true;
      player.pause();
    } else {
      userPausedRef.current = false;
      player.play();
    }
    resetControlsTimeout();
  };

  const handleSeekBackward = () => {
    player.seekBy(-10);
    resetControlsTimeout();
  };

  const handleSeekForward = () => {
    player.seekBy(10);
    resetControlsTimeout();
  };

  const toggleMute = () => {
    player.muted = !player.muted;
    resetControlsTimeout();
  };

  const handleOpenLightbox = () => {
    try {
      player.pause();
    } catch {}
    onOpenLightbox();
  };

  const onTrackLayout = (e: any) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) {
      setTrackWidth(w);
    }
  };

  const handleTrackTouchStart = (e: any) => {
    if (duration <= 0) return;
    const currentWidth = trackWidth > 0 ? trackWidth : width;
    const locX = Math.max(
      0,
      Math.min(currentWidth, e.nativeEvent.locationX ?? 0)
    );
    dragStartRef.current = {
      startX: locX,
      startPageX: e.nativeEvent.pageX ?? locX,
    };
    const ratio = locX / currentWidth;
    setScrubRatio(ratio);
    player.currentTime = ratio * duration;
  };

  const handleTrackTouchMove = (e: any) => {
    if (duration <= 0) return;
    const currentWidth = trackWidth > 0 ? trackWidth : width;
    const pageX = e.nativeEvent.pageX ?? dragStartRef.current.startPageX;
    const deltaX = pageX - dragStartRef.current.startPageX;
    const currentX = Math.max(
      0,
      Math.min(currentWidth, dragStartRef.current.startX + deltaX)
    );
    const ratio = currentX / currentWidth;
    setScrubRatio(ratio);
    player.currentTime = ratio * duration;
  };

  const handleTrackTouchEnd = (e: any) => {
    if (duration <= 0) {
      setIsScrubbing(false);
      return;
    }
    const currentWidth = trackWidth > 0 ? trackWidth : width;
    const pageX = e.nativeEvent.pageX ?? dragStartRef.current.startPageX;
    const deltaX = pageX - dragStartRef.current.startPageX;
    const currentX = Math.max(
      0,
      Math.min(currentWidth, dragStartRef.current.startX + deltaX)
    );
    const ratio = currentX / currentWidth;
    setScrubRatio(ratio);
    player.currentTime = ratio * duration;
    setIsScrubbing(false);
    resetControlsTimeout();
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!uri) return null;

  return (
    <View style={styles.inlineVideoContainer}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFillObject}
        nativeControls={false}
        allowsFullscreen={false}
        contentFit="contain"
      />

      {/* Tap anywhere to toggle controls / play-pause */}
      <Pressable
        onPress={toggleControls}
        style={[
          styles.inlineOverlay,
          (!isPlaying || showControls) && styles.inlineOverlayDimmed,
        ]}
      >
        {/* Center Playback Controls: 10s Rewind, Play/Pause, 10s Forward */}
        {(!isPlaying || showControls) && (
          <View style={styles.inlineCenterControlsRow}>
            {/* Rewind 10s */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleSeekBackward}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.inlineSeekBtn}
            >
              <RotateCcw size={15} color="#FFFFFF" strokeWidth={2.2} />
              <Text style={styles.inlineSeekBtnText}>10s</Text>
            </TouchableOpacity>

            {/* Play / Pause Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={togglePlayPause}
              style={styles.inlineCenterPlayBtn}
            >
              {isPlaying ? (
                <Pause size={24} color="#FFFFFF" fill="#FFFFFF" />
              ) : (
                <Play
                  size={24}
                  color="#FFFFFF"
                  fill="#FFFFFF"
                  style={{ marginLeft: 2 }}
                />
              )}
            </TouchableOpacity>

            {/* Forward 10s */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleSeekForward}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.inlineSeekBtn}
            >
              <RotateCw size={15} color="#FFFFFF" strokeWidth={2.2} />
              <Text style={styles.inlineSeekBtnText}>10s</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Info Bar: Time on Left, Sound and Fullscreen on Right */}
        {showControls && (
          <View style={styles.inlineBottomRow}>
            {/* Video Time Badge */}
            <View style={styles.inlineVideoBadge}>
              <View
                style={[
                  styles.inlineLiveDot,
                  { backgroundColor: isPlaying ? accentColor : "#9CA3AF" },
                ]}
              />
              <Text style={styles.inlineVideoBadgeText}>
                {formatTime(effectiveTime)} / {formatTime(duration)}
              </Text>
            </View>

            {/* Right Bottom Actions: Sound and Fullscreen */}
            <View style={styles.inlineBottomActions}>
              {/* Sound Toggle Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={toggleMute}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.inlineIconBtn}
              >
                {isMuted ? (
                  <VolumeX size={15} color="#FFFFFF" strokeWidth={2.2} />
                ) : (
                  <Volume2 size={15} color="#FFFFFF" strokeWidth={2.2} />
                )}
              </TouchableOpacity>

              {/* Fullscreen Lightbox Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleOpenLightbox}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.inlineIconBtn}
              >
                <Maximize2 size={15} color="#FFFFFF" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Pressable>

      {/* Bottom Timeline Line: interactive scrubber to click/drag forward/backward */}
      <View
        style={styles.inlineProgressContainer}
        onLayout={onTrackLayout}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleTrackTouchStart}
        onResponderMove={handleTrackTouchMove}
        onResponderRelease={handleTrackTouchEnd}
        onResponderTerminate={() => {
          setIsScrubbing(false);
        }}
      >
        <View style={styles.inlineProgressTrack} pointerEvents="none">
          <View
            style={[
              styles.inlineProgressFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: accentColor,
              },
            ]}
            pointerEvents="none"
          />
        </View>

        {/* Scrubber Thumb Indicator */}
        <View
          style={[
            styles.inlineScrubberThumb,
            {
              left: `${progressPercent}%`,
              backgroundColor: accentColor,
              transform: [{ scale: isScrubbing ? 1.4 : 1 }],
            },
          ]}
          pointerEvents="none"
        />
      </View>
    </View>
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
    backgroundColor: withTiming(isActive ? activeColor : "#9ca3af", {
      duration: 250,
    }),
  }));

  return (
    <Animated.View style={[styles.dot, animStyle]}>
      {isVideo && isActive && <Play size={7} color="#fff" fill="#fff" />}
    </Animated.View>
  );
};

// ─── Main Component ───────────────────────────────────────────
const ImageVideoCarousel: React.FC<{ data: MediaItem[]; title?: string }> = ({
  data,
  title,
}) => {
  const { colors } = useTheme();
  const isFocused = useIsFocused();
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      setAppState(nextState);
    });
    return () => sub.remove();
  }, []);

  const isScreenActive = isFocused && appState === "active";

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 51 });

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index ?? 0);
  }, []);

  if (!data || data.length === 0) return null;

  return (
    <>
      <View style={[styles.root, { borderColor: colors.border }]}>
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
            <View style={styles.slide}>
              {item.type === "video" && item.video ? (
                <VideoItem
                  uri={item.video}
                  shouldPlay={isScreenActive && !lightboxOpen && activeIndex === index}
                  accentColor={colors.primary}
                  onOpenLightbox={() => {
                    setLightboxIndex(index);
                    setLightboxOpen(true);
                  }}
                />
              ) : item.image ? (
                <TouchableOpacity
                  activeOpacity={0.95}
                  onPress={() => {
                    setLightboxIndex(index);
                    setLightboxOpen(true);
                  }}
                  style={StyleSheet.absoluteFillObject}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={StyleSheet.absoluteFillObject}
                    contentFit="contain"
                    transition={200}
                  />
                </TouchableOpacity>
              ) : null}
            </View>
          )}
        />

        {/* ── Dots indicator ── */}
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

      <ProductMediaLightbox
        data={data}
        initialIndex={lightboxIndex}
        visible={isScreenActive && lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        accentColor={colors.primary}
        title={title}
      />
    </>
  );
};

export default ImageVideoCarousel;

const styles = StyleSheet.create({
  root: {
    width,
    height: CAROUSEL_HEIGHT,
    borderBottomWidth: 1,
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
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  dot: {
    height: 7,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  inlineVideoContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000000",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  inlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  inlineOverlayDimmed: {
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  inlineBottomRow: {
    position: "absolute",
    bottom: 26,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 15,
  },
  inlineVideoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  inlineLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  inlineVideoBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    letterSpacing: 0.2,
  },
  inlineBottomActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inlineIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  inlineCenterControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 22,
    zIndex: 20,
  },
  inlineSeekBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  inlineSeekBtnText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontFamily: "Poppins_600SemiBold",
    marginTop: -2,
    letterSpacing: 0.2,
  },
  inlineCenterPlayBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  inlineProgressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 22,
    justifyContent: "flex-end",
    paddingBottom: 2,
    zIndex: 25,
  },
  inlineProgressTrack: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
    borderRadius: 2,
  },
  inlineProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  inlineScrubberThumb: {
    position: "absolute",
    bottom: -3,
    width: 14,
    height: 14,
    borderRadius: 7,
    marginLeft: -7,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 4,
  },
});
