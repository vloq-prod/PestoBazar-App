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
} from "react-native";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  X,
  Play,
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

// ─── Standard Video Player ───────────────────────────────────
const LightboxVideo = ({
  uri,
  shouldPlay,
}: {
  uri: string;
  shouldPlay: boolean;
}) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
  });

  useEffect(() => {
    if (!player) return;
    if (shouldPlay) {
      player.play();
    } else {
      player.pause();
      player.currentTime = 0;
    }
  }, [shouldPlay, player]);

  return (
    <VideoView
      player={player}
      style={styles.fullscreenMedia}
      nativeControls={true}
      contentFit="contain"
    />
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

  if (!data || data.length === 0) return null;

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
                    shouldPlay={activeIndex === index}
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
});
