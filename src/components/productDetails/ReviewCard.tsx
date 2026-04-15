import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import React from "react";
import { useTheme } from "../../theme";
import { MessageCircleReply, Star, Play } from "lucide-react-native";
import { Image } from "expo-image";
import { useResponsive } from "../../utils/useResponsive";
import { ReviewItem } from "../../types/productdetails.types";

// ─── Helpers ─────────────────────────────────────────────────────
const getInitials = (name: string) => {
  if (!name) return "";
  const words = name.trim().split(" ");
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

// ─── Star Row ────────────────────────────────────────────────────
const StarRow = ({
  rating,
  starColor,
  size = 10,
}: {
  rating: number;
  starColor: string;
  size?: number;
}) => (
  <View style={{ flexDirection: "row", gap: 2, alignItems: "center" }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={size}
        strokeWidth={1.8}
        color={i < rating ? starColor : "#D3D1C7"}
        fill={i < rating ? starColor : "#D3D1C7"}
      />
    ))}
  </View>
);

// ─── Media Row ───────────────────────────────────────────────────
type MediaItem = { uri: string; type: "image" | "video" };

const MediaRow = ({
  media,
  colors,
  spacing,
}: {
  media: ReviewItem["media"];
  colors: any;
  spacing: (n: number) => number;
}) => {
  
  const allItems: MediaItem[] = [];
  if (media.video) allItems.push({ uri: media.video, type: "video" });
  if (media.first_image)
    allItems.push({ uri: media.first_image, type: "image" });
  media.other_images.forEach((img) =>
    allItems.push({ uri: img, type: "image" }),
  );

  if (allItems.length === 0) return null;

  const MAX_VISIBLE = 4;
  const visible = allItems.slice(0, MAX_VISIBLE);
  const hiddenCount = allItems.length - MAX_VISIBLE;
  const thumbSize = spacing(72);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacing(8), paddingTop: spacing(10) }}
    >
      {visible.map((item, idx) => {

     
        const isLast = idx === MAX_VISIBLE - 1 && hiddenCount > 0;
        return (
          <Pressable
            key={idx}
            style={[
              styles.thumb,
              {
                width: thumbSize,
                height: thumbSize,
                borderRadius: spacing(10),
                borderColor: colors.border,
              },
            ]}
          >
            <Image
              source={{ uri: item.uri }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />

            {item.type === "video" && !isLast && (
              <View style={styles.playOverlay}>
                <View
                  style={[
                    styles.playBtn,
                    { backgroundColor: "rgba(255,255,255,0.92)" },
                  ]}
                >
                  <Play
                    size={spacing(12)}
                    color={colors.primary}
                    fill={colors.primary}
                  />
                </View>
              </View>
            )}

            {isLast && (
              <View style={styles.countOverlay}>
                <Text
                  style={[
                    styles.countText,
                    { fontFamily: "Poppins_700Bold", fontSize: spacing(15) },
                  ]}
                >
                  +{hiddenCount + 1}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

// ─── Review Card ─────────────────────────────────────────────────
type Props = {
  item: ReviewItem;
};

const ReviewCard = ({ item }: Props) => {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();

  const hasMedia =
    item.media.video ||
    item.media.first_image ||
    item.media.other_images.length > 0;

  return (
    <View
      style={[
        styles.reviewCard,
        {
          borderColor: colors.border,
          borderRadius: 10,
        },
      ]}
    >
      {/* ── Header ── */}
      <View style={styles.reviewHeader}>
        <View
          style={[
            styles.avatar,
            {
              width: spacing(34),
              height: spacing(34),
              borderRadius: spacing(34),
              backgroundColor: colors.primary,
            },
          ]}
        >
          <Text
            style={{
              fontSize: font(12),
              fontFamily: "Poppins_700Bold",
              color: colors.textInverse,
              lineHeight: font(12),
            }}
          >
            {getInitials(item.full_name)}
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            gap: spacing(3),
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View style={styles.nameRow}>
            <Text
              style={{
                fontSize: font(13),
                fontFamily: "Poppins_600SemiBold",
                color: colors.text,
                lineHeight: font(18),
              }}
            >
              {item.full_name}
            </Text>

            <View style={styles.starsRow}>
              <StarRow rating={item.rating} starColor={colors.starColor} />
            </View>
          </View>
        </View>
      </View>

      {/* ── Review text ── */}
      <Text
        style={{
          fontSize: font(11),
          fontFamily: "Poppins_400Regular",
          color: colors.textSecondary,
          lineHeight: font(20),
          marginTop: spacing(8),
        }}
      >
        {item.review}
      </Text>

      {/* ── Media row ── */}
      {hasMedia && (
        <MediaRow media={item.media} colors={colors} spacing={spacing} />
      )}

      {/* ── Admin Reply ── */}
      {item.admin_comments && (
        <View
          style={[
            styles.replyBlock,
            {
              marginTop: spacing(10),
              backgroundColor: colors.primary + "0D",
              borderRadius: spacing(10),
              borderWidth: 0.5,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.replyHeader}>
            <View
              style={[
                styles.replyIconBox,
                {
                  backgroundColor: colors.primary,
                  borderRadius: spacing(6),
                  padding: spacing(4),
                },
              ]}
            >
              <MessageCircleReply
                size={spacing(12)}
                color={colors.textInverse}
                strokeWidth={2}
              />
            </View>
            <Text
              style={{
                fontSize: font(12),
                fontFamily: "Poppins_600SemiBold",
                color: colors.primary,
                flex: 1,
              }}
            >
              Admin Comment
            </Text>
          </View>

          <Text
            style={{
              fontSize: font(11),
              fontFamily: "Poppins_400Regular",
              color: colors.textSecondary,
              lineHeight: font(18),
              marginTop: spacing(3),
              paddingLeft: spacing(4),
            }}
          >
            {item.admin_comments}
          </Text>
        </View>
      )}
    </View>
  );
};

export default ReviewCard;

const styles = StyleSheet.create({
  reviewCard: {
    padding: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: "row",
    gap: 5,
    alignItems: "flex-start",
  },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  nameRow: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  thumb: {
    overflow: "hidden",
    borderWidth: 0.5,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  playBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  countOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,15,25,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    color: "#fff",
  },
  replyBlock: {
    padding: 10,
  },
  replyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  replyIconBox: {
    alignSelf: "flex-start",
  },
});
