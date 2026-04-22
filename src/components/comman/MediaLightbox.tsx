import React, { useCallback, useRef, useState } from "react";
import {
  View,
  FlatList,
  Image,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  StatusBar,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { X, Play, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";

const { width } = Dimensions.get("window");

type MediaItem = {
  type: "image" | "video";
  image?: string | null;
  video?: string | null;
};

type Props = {
  data: MediaItem[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
  accentColor: string;
};

// ─── Lightbox Video ───────────────────────────────────────────
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

// ─── Thumbnail ────────────────────────────────────────────────
const Thumbnail = ({
  item,
  isActive,
  onPress,
  accentColor,
  size,
}: {
  item: MediaItem;
  isActive: boolean;
  onPress: () => void;
  accentColor: string;
  size: number;
}) => {
  const animStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(isActive ? accentColor : "rgba(255,255,255,0.15)", {
      duration: 220,
    }),
    transform: [
      {
        scale: withTiming(isActive ? 1 : 0.85, {
          duration: 220,
          easing: Easing.out(Easing.cubic),
        }),
      },
    ],
  }));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: 10,
            overflow: "hidden",
            borderWidth: 2,
          },
          animStyle,
        ]}
      >
        <Image
          source={{ uri: item.image ?? item.video ?? "" }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
        {/* Dim overlay on inactive */}
        {!isActive && (
          <View
            style={StyleSheet.absoluteFillObject as any}
            pointerEvents="none"
          >
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} />
          </View>
        )}
        {/* Active shimmer border glow */}
        {isActive && (
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                borderRadius: 9,
                borderWidth: 1.5,
                borderColor: accentColor + "60",
              },
            ]}
          />
        )}
        {/* Video play badge */}
        {item.type === "video" && (
          <View
            style={{
              position: "absolute",
              bottom: 5,
              right: 5,
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: "rgba(0,0,0,0.7)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Play size={9} color="#fff" fill="#fff" />
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── Main Lightbox ────────────────────────────────────────────
const MediaLightbox: React.FC<Props> = ({
  data,
  initialIndex,
  visible,
  onClose,
  accentColor,
}) => {
  const insets = useSafeAreaInsets();
  const { font, scale, moderateScale } = useResponsive();

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const mainListRef = useRef<FlatList>(null);
  const thumbListRef = useRef<FlatList>(null);

  const THUMB_SIZE = moderateScale(62);
  const THUMB_GAP = moderateScale(7);

  React.useEffect(() => {
    if (visible) {
      setActiveIndex(initialIndex);
      setTimeout(() => {
        mainListRef.current?.scrollToIndex({
          index: initialIndex,
          animated: false,
        });
        thumbListRef.current?.scrollToIndex({
          index: initialIndex,
          animated: false,
          viewPosition: 0.5,
        });
      }, 60);
    }
  }, [visible, initialIndex]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
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

  const handleThumbPress = (index: number) => {
    setActiveIndex(index);
    mainListRef.current?.scrollToIndex({ index, animated: true });
    thumbListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });
  };

  const handlePrev = () => {
    if (activeIndex > 0) handleThumbPress(activeIndex - 1);
  };

  const handleNext = () => {
    if (activeIndex < data.length - 1) handleThumbPress(activeIndex + 1);
  };

  const activeItem = data[activeIndex];

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

      <View style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
        {/* ── Top Bar ── */}
        <View
          style={{
            paddingTop: insets.top + scale(8),
            paddingHorizontal: scale(16),
            paddingBottom: scale(10),
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Counter pill — center */}
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.15)",
              paddingHorizontal: scale(14),
              paddingVertical: scale(6),
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: scale(4),
            }}
          >
            {activeItem?.type === "video" && (
              <Play size={font(10)} color={accentColor} fill={accentColor} />
            )}
            <Text
              style={{
                fontSize: font(13),
                color: "#fff",
                fontFamily: "Poppins_600SemiBold",
                includeFontPadding: false,
              }}
            >
              {activeIndex + 1}
              <Text
                style={{
                  fontSize: font(12),
                  color: "rgba(255,255,255,0.45)",
                  fontFamily: "Poppins_400Regular",
                }}
              >
                {" "}
                / {data.length}
              </Text>
            </Text>
          </View>

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.8}
            style={{
              width: moderateScale(38),
              height: moderateScale(38),
              borderRadius: moderateScale(19),
              backgroundColor: "rgba(255,255,255,0.1)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.15)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={moderateScale(18)} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ── Main Viewer ── */}
        <View style={{ flex: 1 }}>
          <FlatList
            ref={mainListRef}
            data={data}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => `main-${i}`}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig.current}
            decelerationRate="fast"
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            renderItem={({ item, index }) => (
              <View style={{ width, flex: 1 }}>
                {item.type === "image" ? (
                  <Image
                    source={{ uri: item.image! }}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode="contain"
                  />
                ) : (
                  <LightboxVideo
                    uri={item.video!}
                    shouldPlay={activeIndex === index}
                  />
                )}
              </View>
            )}
          />

          {/* Prev / Next arrows */}
          {activeIndex > 0 && (
            <TouchableOpacity
              onPress={handlePrev}
              activeOpacity={0.8}
              style={{
                position: "absolute",
                left: scale(12),
                top: "50%",
                marginTop: -moderateScale(20),
                width: moderateScale(40),
                height: moderateScale(40),
                borderRadius: moderateScale(20),
                backgroundColor: "rgba(0,0,0,0.45)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.15)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronLeft size={moderateScale(20)} color="#fff" />
            </TouchableOpacity>
          )}
          {activeIndex < data.length - 1 && (
            <TouchableOpacity
              onPress={handleNext}
              activeOpacity={0.8}
              style={{
                position: "absolute",
                right: scale(12),
                top: "50%",
                marginTop: -moderateScale(20),
                width: moderateScale(40),
                height: moderateScale(40),
                borderRadius: moderateScale(20),
                backgroundColor: "rgba(0,0,0,0.45)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.15)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronRight size={moderateScale(20)} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Thumbnail Strip ── */}
        <View
          style={{
            paddingBottom: Math.max(insets.bottom, scale(16)) + scale(8),
            paddingTop: scale(14),
            borderTopWidth: 1,
            borderTopColor: "rgba(255,255,255,0.07)",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          {/* Active item label */}
          <Text
            numberOfLines={1}
            style={{
              fontSize: font(12),
              color: "rgba(255,255,255,0.5)",
              fontFamily: "Poppins_400Regular",
              includeFontPadding: false,
              textAlign: "center",
              marginBottom: scale(10),
              paddingHorizontal: scale(32),
            }}
          >
            {activeItem?.type === "video"
              ? "🎬 Video"
              : `Photo ${activeIndex + 1} of ${data.length}`}
          </Text>

          <FlatList
            ref={thumbListRef}
            data={data}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => `thumb-${i}`}
            contentContainerStyle={{
              paddingHorizontal: scale(16),
              gap: THUMB_GAP,
            }}
            getItemLayout={(_, index) => ({
              length: THUMB_SIZE + THUMB_GAP,
              offset: (THUMB_SIZE + THUMB_GAP) * index,
              index,
            })}
            renderItem={({ item, index }) => (
              <Thumbnail
                item={item}
                isActive={activeIndex === index}
                onPress={() => handleThumbPress(index)}
                accentColor={accentColor}
                size={THUMB_SIZE}
              />
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

export default MediaLightbox;
