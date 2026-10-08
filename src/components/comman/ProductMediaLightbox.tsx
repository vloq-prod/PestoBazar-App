import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  StatusBar,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Check,
  Settings,
  ChevronLeft,
  ChevronRight,
  Video as VideoIcon,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";

const { width, height } = Dimensions.get("window");

export type ProductMediaItem = {
  type: "image" | "video";
  image?: string | null;
  video?: string | null;
};

type Props = {
  data: ProductMediaItem[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
  accentColor?: string;
  title?: string;
};

// ─── Custom Professional Video Player ─────────────────────────
const LightboxVideo = ({
  uri,
  shouldPlay,
  accentColor = "#22C55E",
}: {
  uri: string;
  shouldPlay: boolean;
  accentColor?: string;
}) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
    p.preservesPitch = true;
    p.timeUpdateEventInterval = 0.25;
  });

  const playingEvent = useEvent(player, "playingChange");
  const isPlaying = playingEvent?.isPlaying ?? player.playing;

  const statusEvent = useEvent(player, "statusChange");
  const status = statusEvent?.status ?? player.status;

  const timeEvent = useEvent(player, "timeUpdate");
  const currentTime = timeEvent?.currentTime ?? player.currentTime;

  const rateEvent = useEvent(player, "playbackRateChange");
  const playbackRate = rateEvent?.playbackRate ?? player.playbackRate;

  const [showControls, setShowControls] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubRatio, setScrubRatio] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const dragStartRef = useRef<{ startX: number; startPageX: number }>({
    startX: 0,
    startPageX: 0,
  });
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const duration = player.duration || 0;
  const currentSpeed = playbackRate || 1.0;
  const isEnded = duration > 0 && currentTime >= duration - 0.5;

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying && !showSettingsMenu) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  }, [isPlaying, showSettingsMenu]);

  useEffect(() => {
    if (isPlaying) {
      resetControlsTimeout();
    } else {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, resetControlsTimeout]);

  useEffect(() => {
    if (!player) return;
    if (shouldPlay) {
      player.play();
    } else {
      player.pause();
      player.currentTime = 0;
    }
  }, [shouldPlay, player]);

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
    if (showSettingsMenu) setShowSettingsMenu(false);
  };

  const handlePlayPause = () => {
    if (isEnded) {
      player.replay();
    } else if (isPlaying) {
      player.pause();
    } else {
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

  const onTrackLayout = (e: any) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) {
      setTrackWidth(w);
    }
  };

  const handleTrackTouchStart = (e: any) => {
    if (duration <= 0) return;
    const currentWidth = trackWidth > 0 ? trackWidth : width - 32;
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
    const currentWidth = trackWidth > 0 ? trackWidth : width - 32;
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
    const currentWidth = trackWidth > 0 ? trackWidth : width - 32;
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

  const effectiveTime = isScrubbing ? scrubRatio * duration : currentTime;
  const progressPercent =
    duration > 0
      ? Math.min(100, Math.max(0, (effectiveTime / duration) * 100))
      : 0;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!uri) return null;

  return (
    <View style={styles.videoPlayerContainer}>
      <VideoView
        player={player}
        style={styles.fullscreenMedia}
        nativeControls={false}
        allowsFullscreen={false}
        contentFit="contain"
      />

      {/* Tap anywhere to toggle controls */}
      <Pressable
        onPress={toggleControls}
        style={[
          styles.videoOverlay,
          showControls && styles.videoOverlayVisible,
        ]}
      >
        {status === "loading" && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}

        {showControls && (
          <>
            {/* Center Playback Controls: Compact 10s Rewind/Forward, Hero Play/Pause */}
            <View style={styles.centerControlsRow}>
              {/* Rewind 10s */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={handleSeekBackward}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.seekBtn}
              >
                <RotateCcw size={16} color="#FFFFFF" strokeWidth={2.2} />
                <Text style={styles.seekBtnText}>10s</Text>
              </TouchableOpacity>

              {/* Play / Pause / Replay */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePlayPause}
                style={[
                  styles.centerPlayBtn,
                  { backgroundColor: "rgba(0, 0, 0, 0.6)" },
                ]}
              >
                {isEnded ? (
                  <RotateCcw size={26} color="#FFFFFF" strokeWidth={2.4} />
                ) : isPlaying ? (
                  <Pause size={26} color="#FFFFFF" fill="#FFFFFF" />
                ) : (
                  <Play
                    size={26}
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
                style={styles.seekBtn}
              >
                <RotateCw size={16} color="#FFFFFF" strokeWidth={2.2} />
                <Text style={styles.seekBtnText}>10s</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Controls Bar: Progress Bar, Timecodes & Action Icons */}
            <View style={styles.bottomVideoBar}>
              {/* Scrubber Progress Bar */}
              <View
                style={styles.progressBarWrapper}
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
                <View style={styles.progressTrack} pointerEvents="none">
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${progressPercent}%`,
                        backgroundColor: accentColor,
                      },
                    ]}
                    pointerEvents="none"
                  />
                </View>
                <View
                  style={[
                    styles.scrubberThumb,
                    {
                      left: `${progressPercent}%`,
                      borderColor: accentColor,
                      transform: [{ scale: isScrubbing ? 1.3 : 1 }],
                    },
                  ]}
                  pointerEvents="none"
                />
              </View>

              {/* Bottom Control Info Row */}
              <View style={styles.bottomControlsRow}>
                {/* Time Display */}
                <Text style={styles.timeText}>
                  {formatTime(effectiveTime)}{" "}
                  <Text style={styles.timeDurationText}>
                    / {formatTime(duration)}
                  </Text>
                </Text>

                {/* Right Action: Settings ⚙️ */}
                <View style={styles.bottomRightActions}>
                  {/* Settings ⚙️ Button */}
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => {
                      setShowSettingsMenu((prev) => !prev);
                      resetControlsTimeout();
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={[
                      styles.bottomIconBtn,
                      showSettingsMenu && {
                        backgroundColor: "rgba(255, 255, 255, 0.25)",
                        borderColor: accentColor,
                      },
                    ]}
                  >
                    <Settings size={16} color="#FFFFFF" strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Settings Popover Card: Contains Playback Speed & Zoom Mode */}
            {showSettingsMenu && (
              <View style={styles.settingsMenuCard}>
                {/* Playback Speed Section */}
                <Text style={styles.settingsSectionTitle}>Playback Speed</Text>
                {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => {
                  const isSelected = Math.abs(currentSpeed - rate) < 0.05;
                  return (
                    <TouchableOpacity
                      key={rate}
                      style={[
                        styles.settingsMenuItem,
                        isSelected && styles.settingsMenuItemActive,
                      ]}
                      onPress={() => {
                        player.preservesPitch = true;
                        player.playbackRate = rate;
                        setShowSettingsMenu(false);
                        resetControlsTimeout();
                      }}
                    >
                      <Text
                        style={[
                          styles.settingsMenuItemText,
                          isSelected && {
                            color: accentColor,
                            fontFamily: "Poppins_600SemiBold",
                          },
                        ]}
                      >
                        {rate === 1.0 ? "1.0x (Normal)" : `${rate}x`}
                      </Text>
                      {isSelected && (
                        <Check
                          size={15}
                          color={accentColor}
                          strokeWidth={2.5}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </>
        )}
      </Pressable>
    </View>
  );
};

// ─── Product Media Lightbox ──────────────────────────────────
const ProductMediaLightbox: React.FC<Props> = ({
  data,
  initialIndex,
  visible,
  onClose,
  accentColor,
  title,
}) => {
  const insets = useSafeAreaInsets();
  const { font, scale, moderateScale } = useResponsive();
  const { colors } = useTheme();

  const activeAccent = accentColor || colors.primary || "#22C55E";

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const mainListRef = useRef<FlatList>(null);
  const thumbListRef = useRef<FlatList>(null);

  // Sync initial index on open
  useEffect(() => {
    if (visible) {
      const validIndex = Math.min(Math.max(0, initialIndex), Math.max(0, data.length - 1));
      setActiveIndex(validIndex);
      setTimeout(() => {
        mainListRef.current?.scrollToIndex({
          index: validIndex,
          animated: false,
        });
        thumbListRef.current?.scrollToIndex({
          index: validIndex,
          animated: true,
          viewPosition: 0.5,
        });
      }, 60);
    }
  }, [visible, initialIndex, data.length]);

  const scrollToMedia = useCallback((index: number, animated = true) => {
    if (index < 0 || index >= data.length) return;
    setActiveIndex(index);
    mainListRef.current?.scrollToIndex({ index, animated });
    thumbListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });
  }, [data.length]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      const idx = viewableItems[0].index ?? 0;
      setActiveIndex(idx);
      thumbListRef.current?.scrollToIndex({
        index: idx,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, []);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 51 });

  const handlePrev = () => {
    if (activeIndex > 0) {
      scrollToMedia(activeIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeIndex < data.length - 1) {
      scrollToMedia(activeIndex + 1);
    }
  };

  if (!visible || !data || data.length === 0) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <View style={styles.container}>
        {/* ── Top Header Bar ── */}
        <View
          style={[
            styles.header,
            {
              paddingTop: Math.max(insets.top, 16) + scale(4),
              paddingHorizontal: scale(16),
            },
          ]}
        >
          {/* Counter Badge */}
          <View style={styles.counterBadge}>
            <Text style={[styles.counterText, { fontSize: font(13) }]}>
              {activeIndex + 1} / {data.length}
            </Text>
          </View>

          {/* Optional Title */}
          {title ? (
            <Text
              numberOfLines={1}
              style={[
                styles.headerTitle,
                { fontSize: font(14), marginHorizontal: scale(12) },
              ]}
            >
              {title}
            </Text>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.8}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={[
              styles.iconBtn,
              {
                width: moderateScale(40),
                height: moderateScale(40),
                borderRadius: moderateScale(20),
              },
            ]}
          >
            <X size={moderateScale(20)} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* ── Center Main Media Area ── */}
        <View style={styles.mainMediaArea}>
          <FlatList
            ref={mainListRef}
            data={data}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => `prod-media-${i}`}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig.current}
            decelerationRate="fast"
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            renderItem={({ item, index }) => (
              <View style={styles.slideContainer}>
                {item.type === "image" ? (
                  <Image
                    source={{ uri: item.image || item.video || "" }}
                    style={styles.fullscreenMedia}
                    contentFit="contain"
                    transition={200}
                  />
                ) : (
                  <LightboxVideo
                    uri={item.video || item.image || ""}
                    shouldPlay={visible && activeIndex === index}
                    accentColor={activeAccent}
                  />
                )}
              </View>
            )}
          />

          {/* Left Arrow Button */}
          {activeIndex > 0 && (
            <TouchableOpacity
              onPress={handlePrev}
              activeOpacity={0.8}
              style={[
                styles.arrowBtn,
                {
                  left: scale(14),
                  width: moderateScale(42),
                  height: moderateScale(42),
                  borderRadius: moderateScale(21),
                },
              ]}
            >
              <ChevronLeft size={moderateScale(24)} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          {/* Right Arrow Button */}
          {activeIndex < data.length - 1 && (
            <TouchableOpacity
              onPress={handleNext}
              activeOpacity={0.8}
              style={[
                styles.arrowBtn,
                {
                  right: scale(14),
                  width: moderateScale(42),
                  height: moderateScale(42),
                  borderRadius: moderateScale(21),
                },
              ]}
            >
              <ChevronRight size={moderateScale(24)} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Bottom Thumbnail Strip ── */}
        <View
          style={[
            styles.bottomThumbnailContainer,
            {
              paddingBottom: Math.max(insets.bottom, scale(12)) + scale(6),
            },
          ]}
        >
          <FlatList
            ref={thumbListRef}
            data={data}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => `thumb-${i}`}
            contentContainerStyle={styles.thumbnailListContent}
            getItemLayout={(_, index) => ({
              length: scale(62) + scale(10),
              offset: (scale(62) + scale(10)) * index,
              index,
            })}
            renderItem={({ item, index }) => {
              const isActive = activeIndex === index;
              const isVideo = item.type === "video";
              const thumbUri = item.image || item.video || "";

              return (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => scrollToMedia(index)}
                  style={[
                    styles.thumbnailCard,
                    {
                      width: scale(60),
                      height: scale(60),
                      borderRadius: scale(10),
                      borderColor: isActive ? activeAccent : "rgba(255, 255, 255, 0.2)",
                      borderWidth: isActive ? 2.5 : 1,
                      transform: [{ scale: isActive ? 1.05 : 0.95 }],
                    },
                  ]}
                >
                  <Image
                    source={{ uri: thumbUri }}
                    style={StyleSheet.absoluteFillObject}
                    contentFit="cover"
                    transition={150}
                  />

                  {/* Video Icon Badge */}
                  {isVideo && (
                    <View style={styles.videoBadge}>
                      <Play size={scale(10)} color="#FFFFFF" fill="#FFFFFF" />
                    </View>
                  )}

                  {/* Dim overlay on inactive thumbs */}
                  {!isActive && <View style={styles.inactiveThumbOverlay} />}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default ProductMediaLightbox;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0B10",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 50,
  },
  counterBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  counterText: {
    color: "#FFFFFF",
    fontFamily: "Poppins_600SemiBold",
    includeFontPadding: false,
  },
  headerTitle: {
    flex: 1,
    color: "#E5E7EB",
    fontFamily: "Poppins_500Medium",
    textAlign: "center",
  },
  iconBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  mainMediaArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  slideContainer: {
    width,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenMedia: {
    width: "100%",
    height: "100%",
  },
  arrowBtn: {
    position: "absolute",
    top: "50%",
    marginTop: -21,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 40,
  },
  bottomThumbnailContainer: {
    backgroundColor: "rgba(10, 11, 16, 0.95)",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    zIndex: 50,
  },
  thumbnailListContent: {
    paddingHorizontal: 16,
    gap: 10,
    alignItems: "center",
  },
  thumbnailCard: {
    overflow: "hidden",
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
  },
  videoBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  inactiveThumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  centerControlOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  playPauseBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlayerContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  videoOverlayVisible: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 5,
  },
  centerControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
    zIndex: 20,
  },
  seekBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  seekBtnText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontFamily: "Poppins_600SemiBold",
    marginTop: -2,
    letterSpacing: 0.2,
  },
  centerPlayBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.35)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomVideoBar: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    zIndex: 25,
  },
  progressBarWrapper: {
    width: "100%",
    height: 24,
    justifyContent: "center",
    marginBottom: 6,
  },
  progressTrack: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.28)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  scrubberThumb: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FFFFFF",
    marginLeft: -7,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  bottomControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  timeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    letterSpacing: 0.3,
  },
  timeDurationText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontFamily: "Poppins_400Regular",
  },
  bottomRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bottomIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  settingsMenuCard: {
    position: "absolute",
    bottom: 72,
    right: 16,
    backgroundColor: "rgba(18, 20, 30, 0.96)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 8,
    width: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 50,
  },
  settingsSectionTitle: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    textTransform: "uppercase",
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 4,
    letterSpacing: 0.6,
  },
  settingsMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  settingsMenuItemActive: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  settingsMenuItemText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
});
