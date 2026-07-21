import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import {
  Star,
  Camera,
  Video,
  Send,
  X,
} from "lucide-react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useAppVisitorStore } from "../../store/auth";
import { useSubmitRating } from "../../hooks/homeHooks";

interface Props {
  product_id: number;
  onSuccess?: () => void;
}

const AddReviewForm: React.FC<Props> = ({ product_id, onSuccess }) => {
  const { colors } = useTheme();
  const { font } = useResponsive();

  const [rating, setRating] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    comment: "",
  });
  const [media, setMedia] = useState<{ uri: string; type: "image" | "video" }[]>([]);
  const { visitorId, userId } = useAppVisitorStore();
  const { mutate: submitRatingMutation, isPending: isSubmitting } = useSubmitRating();

  const setField = (key: keyof typeof form) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const pickMedia = async (type: "image" | "video") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need media library permissions to upload review media.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: type === "image" ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      allowsMultipleSelection: type === "image",
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newMedia = result.assets.map((asset) => ({
        uri: asset.uri,
        type: type,
      }));
      setMedia((prev) => [...prev, ...newMedia]);
    }
  };

  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert("Rating Required", "Please select a star rating.");
      return;
    }
    if (!form.name || !form.comment) {
      Alert.alert("Missing Fields", "Please fill in your name and comment.");
      return;
    }

    const imagesPayload = media
      .filter((m) => m.type === "image")
      .map((m, index) => {
        const uri = m.uri;
        const filename = uri.split("/").pop() || `image_${index}.jpg`;
        const ext = filename.split(".").pop() || "jpg";
        const mime = `image/${ext === "png" ? "png" : "jpeg"}`;
        return {
          uri,
          name: filename,
          type: mime,
        };
      });

    const videoItem = media.find((m) => m.type === "video");
    const videoPayload = videoItem
      ? {
          uri: videoItem.uri,
          name: videoItem.uri.split("/").pop() || "video.mp4",
          type: "video/mp4",
        }
      : undefined;

    submitRatingMutation(
      {
        visitor_id: visitorId || "",
        product_id: String(product_id),
        user_id: userId || "",
        rating: String(rating),
        rating_comment: form.comment,
        rating_full_name: form.name,
        rating_email: form.email || "guest@pestobazaar.com",
        images: imagesPayload,
        video: videoPayload,
      },
      {
        onSuccess: (data) => {
          if (data.status === 1) {
            Alert.alert("Success", data.message || "Your review has been submitted successfully!");
            setForm({ name: "", email: "", comment: "" });
            setRating(0);
            setMedia([]);
            onSuccess?.();
          } else {
            Alert.alert("Failed", data.message || "Failed to submit review");
          }
        },
        onError: (err: any) => {
          Alert.alert("Error", err?.message || "Something went wrong while submitting the review");
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: font(17), color: colors.text }]}>
          Write a Review
        </Text>
        <Text style={[styles.subtitle, { fontSize: font(12), color: colors.textSecondary }]}>
          Your feedback matters to us and other shoppers
        </Text>
      </View>

      {/* Star Rating */}
      <View style={styles.ratingSection}>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              activeOpacity={0.7}
              style={styles.starTouch}
            >
              <Star
                size={32}
                color={star <= rating ? "#FFB800" : colors.textTertiary}
                fill={star <= rating ? "#FFB800" : "transparent"}
              />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.ratingLabel, { color: colors.textTertiary }]}>
          {rating > 0 ? `You rated this ${rating} out of 5 stars` : "Tap to rate your experience"}
        </Text>
      </View>

      {/* Form Fields */}
      <View style={styles.formFields}>
        <FormField
          label="Your Name"
          placeholder="Enter your name"
          value={form.name}
          onChange={setField("name")}
        />
        <FormField
          label="Email Address"
          placeholder="example@mail.com"
          value={form.email}
          onChange={setField("email")}
          keyboardType="email-address"
        />
        <FormField
          label="Detailed Review"
          placeholder="What did you like or dislike? How was the quality?"
          value={form.comment}
          onChange={setField("comment")}
          multiline
        />
      </View>

      {/* Media Upload and Preview */}
      <View style={styles.mediaSection}>
        <Text style={[styles.sectionLabel, { fontSize: font(12), color: colors.textSecondary }]}>
          Photos & Videos
        </Text>
        
        <View style={styles.mediaButtonsRow}>
          <TouchableOpacity
            onPress={() => pickMedia("image")}
            style={[styles.mediaBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
          >
            <Camera size={20} color={colors.primary} />
            <Text style={[styles.mediaBtnText, { color: colors.textSecondary }]}>Add Photos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => pickMedia("video")}
            style={[styles.mediaBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
          >
            <Video size={20} color={colors.primary} />
            <Text style={[styles.mediaBtnText, { color: colors.textSecondary }]}>Add Video</Text>
          </TouchableOpacity>
        </View>

        {media.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewScroll} contentContainerStyle={styles.previewContainer}>
            {media.map((item, index) => (
              <View key={index} style={styles.previewItem}>
                <Image source={{ uri: item.uri }} style={styles.previewImage} />
                {item.type === "video" && (
                  <View style={styles.videoOverlay}>
                    <Video size={16} color="#fff" />
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => removeMedia(index)}
                  style={styles.removeBtn}
                >
                  <X size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isSubmitting}
        activeOpacity={0.8}
        style={[
          styles.submitBtn,
          {
            backgroundColor: colors.primary,
            opacity: isSubmitting ? 0.7 : 1,
          },
        ]}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Text style={[styles.submitBtnText, { fontSize: font(13.5) }]}>Submit Review</Text>
            <Send size={15} color="#fff" />
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const FormField = ({
  label,
  placeholder,
  value,
  onChange,
  multiline = false,
  keyboardType = "default",
}: any) => {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const [focused, setFocused] = useState(false);
  return (
    <View>
      <Text
        style={{
          fontFamily: "Poppins_500Medium",
          fontSize: font(12.5),
          color: colors.text,
          marginLeft: 1,
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <TextInput
        style={{
          borderWidth: 1.2,
          borderColor: focused ? colors.primary : colors.border,
          borderRadius: 12,
          backgroundColor: colors.inputBackground ?? colors.surface,
          color: colors.text,
          fontSize: font(13),
          fontFamily: "Poppins_400Regular",
          paddingHorizontal: spacing(12),
          paddingVertical: spacing(12),
          minHeight: multiline ? 100 : 48,
          textAlignVertical: multiline ? "top" : "center",
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        value={value}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType={keyboardType}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  header: {
    gap: 4,
  },
  title: {
    fontFamily: "Poppins_700Bold",
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
  },
  ratingSection: {
    alignItems: "center",
    gap: 8,
  },
  starsRow: {
    flexDirection: "row",
    gap: 12,
  },
  starTouch: {
    padding: 4,
  },
  ratingLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
  },
  formFields: {
    gap: 10,
  },

  mediaSection: {
    gap: 10,
  },
  sectionLabel: {
    fontFamily: "Poppins_500Medium",
    marginLeft: 4,
  },
  mediaButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  mediaBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  mediaBtnText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
  },
  previewScroll: {
    marginTop: 8,
  },
  previewContainer: {
    gap: 12,
  },
  previewItem: {
    width: 70,
    height: 70,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  submitBtn: {
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitBtnText: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
  },
});

export default AddReviewForm;
