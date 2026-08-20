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
  ScrollView,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  X,
  Play,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle2,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";

const { width } = Dimensions.get("window");

export type ReviewInfo = {
  full_name?: string;
  rating?: number;
  review?: string;
  created_at?: string;
  admin_comments?: string | null;
};

export type MediaItem = {
  type: "image" | "video";
  image?: string | null;
  video?: string | null;
  reviewInfo?: ReviewInfo;
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
  const { colors } = useTheme();

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const mainListRef = useRef<FlatList>(null);

  React.useEffect(() => {
    if (visible) {
      setActiveIndex(initialIndex);
      setTimeout(() => {
        mainListRef.current?.scrollToIndex({
          index: initialIndex,
          animated: false,
        });
      }, 60);
    }
  }, [visible, initialIndex]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const idx = viewableItems[0].index ?? 0;
      setActiveIndex(idx);
    }
  }, []);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 51 });

  const handlePrev = () => {
    if (activeIndex > 0) {
      const nextIdx = activeIndex - 1;
      setActiveIndex(nextIdx);
      mainListRef.current?.scrollToIndex({ index: nextIdx, animated: true });
    }
  };

  const handleNext = () => {
    if (activeIndex < data.length - 1) {
      const nextIdx = activeIndex + 1;
      setActiveIndex(nextIdx);
      mainListRef.current?.scrollToIndex({ index: nextIdx, animated: true });
    }
  };

  const activeItem = data[activeIndex] || data[0];
  const reviewInfo = activeItem?.reviewInfo;
  const ratingValue = reviewInfo?.rating || 5;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <View style={{ flex: 1, backgroundColor: "#0D0E15" }}>
        {/* ── Top Half: Dark Media Viewer ── */}
        <View
          style={{
            height: "46%",
            backgroundColor: "#0D0E15",
            position: "relative",
          }}
        >
          {/* Media Carousel */}
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
              <View
                style={{
                  width,
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
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

          {/* Close Button (Top Right) */}
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.8}
            style={{
              position: "absolute",
              top: Math.max(insets.top, 16) + scale(4),
              right: scale(16),
              width: moderateScale(40),
              height: moderateScale(40),
              borderRadius: moderateScale(20),
              backgroundColor: "rgba(255, 255, 255, 0.18)",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.25)",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 40,
            }}
          >
            <X size={moderateScale(20)} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Left Arrow Button */}
          {activeIndex > 0 && (
            <TouchableOpacity
              onPress={handlePrev}
              activeOpacity={0.8}
              style={{
                position: "absolute",
                left: scale(14),
                top: "50%",
                marginTop: -moderateScale(22),
                width: moderateScale(44),
                height: moderateScale(44),
                borderRadius: moderateScale(22),
                backgroundColor: "#FFFFFF",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
                alignItems: "center",
                justifyContent: "center",
                zIndex: 40,
              }}
            >
              <ChevronLeft size={moderateScale(24)} color="#1F2937" />
            </TouchableOpacity>
          )}

          {/* Right Arrow Button */}
          {activeIndex < data.length - 1 && (
            <TouchableOpacity
              onPress={handleNext}
              activeOpacity={0.8}
              style={{
                position: "absolute",
                right: scale(14),
                top: "50%",
                marginTop: -moderateScale(22),
                width: moderateScale(44),
                height: moderateScale(44),
                borderRadius: moderateScale(22),
                backgroundColor: "#FFFFFF",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
                alignItems: "center",
                justifyContent: "center",
                zIndex: 40,
              }}
            >
              <ChevronRight size={moderateScale(24)} color="#1F2937" />
            </TouchableOpacity>
          )}

          {/* Bottom Counter Pill e.g. 9 / 24 */}
          <View
            style={{
              position: "absolute",
              bottom: scale(14),
              alignSelf: "center",
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              paddingHorizontal: scale(16),
              paddingVertical: scale(6),
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.15)",
              zIndex: 30,
            }}
          >
            <Text
              style={{
                fontSize: font(13),
                color: "#FFFFFF",
                fontFamily: "Poppins_600SemiBold",
                includeFontPadding: false,
              }}
            >
              {activeIndex + 1} / {data.length}
            </Text>
          </View>
        </View>

        {/* ── Bottom Half: White Review Sheet ── */}
        <View
          style={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            marginTop: -12,
            overflow: "hidden",
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: scale(20),
              paddingTop: scale(12),
              paddingBottom: Math.max(insets.bottom, scale(20)) + scale(16),
            }}
          >
            {/* Sheet Handle Indicator Bar */}
            <View
              style={{
                width: scale(38),
                height: scale(4),
                borderRadius: 2,
                backgroundColor: "#E5E7EB",
                alignSelf: "center",
                marginBottom: scale(14),
              }}
            />

            {/* Header Tag & Rating Badge */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontSize: font(11),
                  fontFamily: "Poppins_700Bold",
                  color: "#4B5563",
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                }}
              >
                CUSTOMER REVIEW
              </Text>

              <View
                style={{
                  backgroundColor: "#F97316", // Bright Orange Badge
                  paddingHorizontal: scale(12),
                  paddingVertical: scale(4),
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: font(12.5),
                    fontFamily: "Poppins_700Bold",
                    color: "#FFFFFF",
                  }}
                >
                  {ratingValue}/5
                </Text>
              </View>
            </View>

            {/* Customer Full Name */}
            <Text
              style={{
                fontSize: font(20),
                fontFamily: "Poppins_700Bold",
                color: "#111827",
                marginTop: scale(6),
              }}
            >
              {reviewInfo?.full_name || "Customer Review"}
            </Text>

            {/* Rating Stars & Created Date */}
            <View style={{ marginTop: scale(8), gap: scale(4) }}>
              <View
                style={{
                  flexDirection: "row",
                  gap: scale(4),
                  alignItems: "center",
                }}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={font(18)}
                    strokeWidth={1.5}
                    color={i < ratingValue ? "#F59E0B" : "#E5E7EB"}
                    fill={i < ratingValue ? "#F59E0B" : "#E5E7EB"}
                  />
                ))}
              </View>

              {reviewInfo?.created_at ? (
                <Text
                  style={{
                    fontSize: font(12.5),
                    fontFamily: "Poppins_400Regular",
                    color: "#6B7280",
                    marginTop: scale(2),
                  }}
                >
                  {reviewInfo.created_at}
                </Text>
              ) : null}
            </View>

            {/* Thin Divider Line */}
            <View
              style={{
                height: 1,
                backgroundColor: "#F3F4F6",
                marginVertical: scale(16),
              }}
            />

            {/* Review Label & Content Paragraph */}
            <Text
              style={{
                fontSize: font(13.5),
                fontFamily: "Poppins_600SemiBold",
                color: "#111827",
                marginBottom: scale(8),
              }}
            >
              Review
            </Text>

            <Text
              style={{
                fontSize: font(13),
                fontFamily: "Poppins_400Regular",
                color: "#374151",
                lineHeight: font(21),
              }}
            >
              {reviewInfo?.review || "No detailed review text available."}
            </Text>

            {/* Admin Comment Box */}
            {reviewInfo?.admin_comments ? (
              <View
                style={{
                  backgroundColor: "#F5F3FF", // Soft purple background
                  borderRadius: 12,
                  padding: scale(14),
                  marginTop: scale(16),
                  borderLeftWidth: 4,
                  borderLeftColor: "#7C3AED", // Vivid purple accent border
                }}
              >
                <Text
                  style={{
                    fontSize: font(13),
                    fontFamily: "Poppins_600SemiBold",
                    color: "#5B21B6",
                    marginBottom: scale(4),
                  }}
                >
                  Admin Comment
                </Text>
                <Text
                  style={{
                    fontSize: font(12.5),
                    fontFamily: "Poppins_400Regular",
                    color: "#4C1D95",
                    lineHeight: font(19),
                  }}
                >
                  {reviewInfo.admin_comments}
                </Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default MediaLightbox;
