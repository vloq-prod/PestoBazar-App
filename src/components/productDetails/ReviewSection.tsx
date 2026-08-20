import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import React, { useState, useMemo } from "react";
import { Image } from "expo-image";
import { Play, Star, CheckCircle2 } from "lucide-react-native";
import ReviewCard from "./ReviewCard";
import { useProductReviews } from "../../hooks/productDetailsHook";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { useRouter } from "expo-router";
import AddReviewForm from "./AddReviewForm";
import MediaLightbox, { MediaItem } from "../comman/MediaLightbox";

type Props = {
  product_id: number;
};

const ReviewSection = ({ product_id }: Props) => {
  const { reviews, mediaGallery, ratingSummary, loading, error } =
    useProductReviews({
      product_id,
    });

  const router = useRouter();
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();

  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const limitedReviews = reviews?.slice(0, 6) || [];

  // Calculate ratings and sentiment label from ratingSummary
  const avgRating = ratingSummary?.average_rating
    ? Number(ratingSummary.average_rating).toFixed(1)
    : "4.3";

  const totalReviewsCount = ratingSummary?.total_reviews
    ? ratingSummary.total_reviews.toLocaleString("en-IN")
    : reviews.length > 0
    ? reviews.length.toString()
    : "0";

  const numericRating = parseFloat(avgRating);
  let sentimentLabel = "Very Good";
  let sentimentBg = "#ECFDF5";
  let sentimentColor = "#059669";

  if (numericRating >= 4.5) {
    sentimentLabel = "Excellent";
    sentimentBg = "#ECFDF5";
    sentimentColor = "#059669";
  } else if (numericRating >= 4.0) {
    sentimentLabel = "Very Good";
    sentimentBg = "#ECFDF5";
    sentimentColor = "#059669";
  } else if (numericRating >= 3.0) {
    sentimentLabel = "Good";
    sentimentBg = "#FEF3C7";
    sentimentColor = "#D97706";
  } else {
    sentimentLabel = "Average";
    sentimentBg = "#FEE2E2";
    sentimentColor = "#DC2626";
  }

  // Build full gallery items for lightbox with review data attached
  const galleryItems: MediaItem[] = useMemo(() => {
    if (mediaGallery && mediaGallery.length > 0) {
      return mediaGallery.map((item) => ({
        type: (item.media.type === "video" ? "video" : "image") as
          | "image"
          | "video",
        image: item.media.url,
        video: item.media.type === "video" ? item.media.url : null,
        reviewInfo: {
          full_name: item.full_name,
          rating: item.rating,
          review: item.review,
          created_at: item.created_at,
          admin_comments: item.admin_comments,
        },
      }));
    }

    // Fallback: collect from reviews list
    const items: MediaItem[] = [];
    reviews.forEach((r) => {
      const info = {
        full_name: r.full_name,
        rating: r.rating,
        review: r.review,
        created_at: r.created_at,
        admin_comments: r.admin_comments,
      };

      if (r.media?.video) {
        items.push({
          type: "video",
          video: r.media.video,
          image: r.media.first_image,
          reviewInfo: info,
        });
      }
      if (r.media?.first_image) {
        items.push({
          type: "image",
          image: r.media.first_image,
          reviewInfo: info,
        });
      }
      if (Array.isArray(r.media?.other_images)) {
        r.media.other_images.forEach((img) => {
          items.push({
            type: "image",
            image: img,
            reviewInfo: info,
          });
        });
      }
    });

    return items;
  }, [mediaGallery, reviews]);

  const handleMediaItemPress = (index: number) => {
    setLightboxIndex(index);
    setLightboxVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 8, color: colors.textSecondary }}>
          Reviews Loading
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Failed to load reviews. Please try again.
        </Text>
      </View>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <View style={styles.container}>
        <AddReviewForm product_id={product_id} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { gap: spacing(20) }]}>
      {/* ─── Add Review Form Component ─── */}
      <AddReviewForm product_id={product_id} />

      {/* ─── Ratings and reviews Header ─── */}
      <View style={{ paddingHorizontal: 16, gap: spacing(4) }}>
        <Text
          style={{
            fontSize: font(20),
            fontFamily: "Poppins_700Bold",
            color: colors.text,
          }}
        >
          Ratings and reviews
        </Text>

        {/* Overall Rating Row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing(8),
            marginTop: spacing(4),
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing(4),
            }}
          >
            <Text
              style={{
                fontSize: font(22),
                fontFamily: "Poppins_700Bold",
                color: colors.text,
                lineHeight: font(28),
              }}
            >
              {avgRating}
            </Text>
            <Star size={font(18)} color="#059669" fill="#059669" />
          </View>

          {/* Sentiment Badge */}
          <View
            style={{
              backgroundColor: sentimentBg,
              paddingHorizontal: spacing(10),
              paddingVertical: spacing(3),
              borderRadius: spacing(6),
            }}
          >
            <Text
              style={{
                fontSize: font(12.5),
                fontFamily: "Poppins_600SemiBold",
                color: sentimentColor,
              }}
            >
              {sentimentLabel}
            </Text>
          </View>
        </View>

        {/* Verified Buyers Line */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing(4),
            marginTop: spacing(2),
          }}
        >
          <Text
            style={{
              fontSize: font(12.5),
              fontFamily: "Poppins_400Regular",
              color: colors.textSecondary,
            }}
          >
            based on {totalReviewsCount} ratings by
          </Text>
          <CheckCircle2 size={13} color={colors.textSecondary} />
          <Text
            style={{
              fontSize: font(12.5),
              fontFamily: "Poppins_500Medium",
              color: colors.textSecondary,
            }}
          >
            Verified Buyers
          </Text>
        </View>
      </View>

      {/* ─── Customer Media Asymmetric Grid (Matching Screenshot) ─── */}
      {galleryItems.length > 0 && (
        <View style={{ paddingHorizontal: 16, marginTop: spacing(4) }}>
          <View
            style={{
              flexDirection: "row",
              gap: spacing(10),
              height: spacing(190),
            }}
          >
            {/* ── Left Large Featured Item (Index 0) ── */}
            <Pressable
              onPress={() => handleMediaItemPress(0)}
              style={{
                flex: 1,
                height: "100%",
                borderRadius: spacing(16),
                overflow: "hidden",
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
                position: "relative",
              }}
            >
              <Image
                source={{
                  uri: galleryItems[0].image || galleryItems[0].video || "",
                }}
                style={StyleSheet.absoluteFillObject}
                contentFit="cover"
              />

              {/* Video Duration / Play Pill */}
              {galleryItems[0].type === "video" && (
                <View
                  style={{
                    position: "absolute",
                    bottom: spacing(10),
                    left: spacing(10),
                    backgroundColor: "rgba(0, 0, 0, 0.65)",
                    paddingHorizontal: spacing(8),
                    paddingVertical: spacing(4),
                    borderRadius: spacing(14),
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing(4),
                  }}
                >
                  <Play size={10} color="#FFFFFF" fill="#FFFFFF" />
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: font(11),
                      fontFamily: "Poppins_600SemiBold",
                    }}
                  >
                    0:13
                  </Text>
                </View>
              )}
            </Pressable>

            {/* ── Right 2x2 Grid (Indices 1 to 4) ── */}
            {galleryItems.length > 1 && (
              <View
                style={{
                  flex: 1,
                  gap: spacing(10),
                  justifyContent: "space-between",
                }}
              >
                {/* Row 1 (Items 1 and 2) */}
                <View
                  style={{ flex: 1, flexDirection: "row", gap: spacing(10) }}
                >
                  {galleryItems[1] && (
                    <Pressable
                      onPress={() => handleMediaItemPress(1)}
                      style={{
                        flex: 1,
                        height: "100%",
                        borderRadius: spacing(14),
                        overflow: "hidden",
                        backgroundColor: colors.background,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <Image
                        source={{
                          uri:
                            galleryItems[1].image ||
                            galleryItems[1].video ||
                            "",
                        }}
                        style={StyleSheet.absoluteFillObject}
                        contentFit="cover"
                      />
                    </Pressable>
                  )}

                  {galleryItems[2] && (
                    <Pressable
                      onPress={() => handleMediaItemPress(2)}
                      style={{
                        flex: 1,
                        height: "100%",
                        borderRadius: spacing(14),
                        overflow: "hidden",
                        backgroundColor: colors.background,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <Image
                        source={{
                          uri:
                            galleryItems[2].image ||
                            galleryItems[2].video ||
                            "",
                        }}
                        style={StyleSheet.absoluteFillObject}
                        contentFit="cover"
                      />
                    </Pressable>
                  )}
                </View>

                {/* Row 2 (Items 3 and 4) */}
                {galleryItems.length > 3 && (
                  <View
                    style={{ flex: 1, flexDirection: "row", gap: spacing(10) }}
                  >
                    {galleryItems[3] && (
                      <Pressable
                        onPress={() => handleMediaItemPress(3)}
                        style={{
                          flex: 1,
                          height: "100%",
                          borderRadius: spacing(14),
                          overflow: "hidden",
                          backgroundColor: colors.background,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        <Image
                          source={{
                            uri:
                              galleryItems[3].image ||
                              galleryItems[3].video ||
                              "",
                          }}
                          style={StyleSheet.absoluteFillObject}
                          contentFit="cover"
                        />
                      </Pressable>
                    )}

                    {galleryItems[4] && (
                      <Pressable
                        onPress={() => handleMediaItemPress(4)}
                        style={{
                          flex: 1,
                          height: "100%",
                          borderRadius: spacing(14),
                          overflow: "hidden",
                          backgroundColor: colors.background,
                          borderWidth: 1,
                          borderColor: colors.border,
                          position: "relative",
                        }}
                      >
                        <Image
                          source={{
                            uri:
                              galleryItems[4].image ||
                              galleryItems[4].video ||
                              "",
                          }}
                          style={StyleSheet.absoluteFillObject}
                          contentFit="cover"
                        />

                        {/* Count Overlay for extra photos e.g. +980 or +12 */}
                        {galleryItems.length > 5 && (
                          <View
                            style={{
                              ...StyleSheet.absoluteFillObject,
                              backgroundColor: "rgba(0, 0, 0, 0.55)",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text
                              style={{
                                color: "#FFFFFF",
                                fontFamily: "Poppins_700Bold",
                                fontSize: font(17),
                              }}
                            >
                              +{galleryItems.length - 4}
                            </Text>
                          </View>
                        )}
                      </Pressable>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      )}

      {/* ─── Reviews List ─── */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 12,
        }}
      >
        {limitedReviews.map((item) => (
          <View key={item.id}>
            <ReviewCard item={item} />
          </View>
        ))}
      </ScrollView>

      {reviews.length > 0 && (
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "(stack)/reviews/[reviewsid]",
              params: {
                reviewsid: product_id,
              },
            })
          }
          style={{
            height: 44,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
            marginHorizontal: 16,
          }}
        >
          <Text
            style={{
              color: colors.primary,
              fontFamily: "Poppins_600SemiBold",
              fontSize: font(13),
            }}
          >
            View all reviews
          </Text>
        </TouchableOpacity>
      )}

      {/* ─── Full Screen Media Lightbox Modal ─── */}
      <MediaLightbox
        data={galleryItems}
        initialIndex={lightboxIndex}
        visible={lightboxVisible}
        onClose={() => setLightboxVisible(false)}
        accentColor={colors.primary}
      />
    </View>
  );
};

export default ReviewSection;

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
  },
  centered: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
  },
  emptyText: {
    color: "#888",
    fontSize: 14,
  },
});
