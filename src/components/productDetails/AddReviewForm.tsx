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
  User,
  Mail,
  Camera,
  Video,
  Send,
  MessageSquare,
  X,
} from "lucide-react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
// import * as ImagePicker from "expo-image-picker"; // ⚠️ Requires installation: npx expo install expo-image-picker

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (key: keyof typeof form) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const pickMedia = async (type: "image" | "video") => {
    // ⚠️ MOCK Implementation for now. To use actual picker:
    // 1. Run: npx expo install expo-image-picker
    // 2. Uncomment the ImagePicker imports and logic
    
    /*
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: type === "image" ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newMedia = result.assets.map(asset => ({ uri: asset.uri, type: asset.type as "image" | "video" }));
      setMedia(prev => [...prev, ...newMedia]);
    }
    */

    Alert.alert("Note", "Please run 'npx expo install expo-image-picker' to enable media uploads. I've added a mock selection for now.", [
      { text: "Mock Image", onPress: () => setMedia(prev => [...prev, { uri: "https://picsum.photos/200", type: "image" }]) },
      { text: "Cancel", style: "cancel" }
    ]);
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

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert("Success", "Your review has been submitted successfully!");
      setForm({ name: "", email: "", comment: "" });
      setRating(0);
      setMedia([]);
      onSuccess?.();
    }, 2000);
  };

  const FormField = ({
    label,
    placeholder,
    icon: Icon,
    value,
    onChange,
    multiline = false,
    keyboardType = "default",
  }: any) => {
    const [focused, setFocused] = useState(false);
    return (
      <View style={{ gap: 6, marginBottom: 16 }}>
        <Text
          style={{
            fontFamily: "Poppins_500Medium",
            fontSize: font(12),
            color: colors.textSecondary,
            marginLeft: 4,
          }}
        >
          {label}
        </Text>
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.background,
              borderColor: focused ? colors.primary : colors.border,
              borderWidth: focused ? 1.5 : 1,
              height: multiline ? 120 : 52,
              paddingVertical: multiline ? 12 : 0,
            },
          ]}
        >
          {Icon && (
            <Icon
              size={18}
              color={focused ? colors.primary : colors.textSecondary}
              style={{ marginTop: multiline ? 2 : 0 }}
            />
          )}
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor={colors.textTertiary}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            multiline={multiline}
            keyboardType={keyboardType}
            style={[
              styles.textInput,
              {
                color: colors.text,
                fontSize: font(14),
                textAlignVertical: multiline ? "top" : "center",
              },
            ]}
          />
        </View>
      </View>
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
              <FontAwesome
                name={star <= rating ? "star" : "star-o"}
                size={34}
                color={star <= rating ? "#FFB800" : colors.textTertiary}
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
          icon={User}
          value={form.name}
          onChange={setField("name")}
        />
        <FormField
          label="Email Address"
          placeholder="example@mail.com"
          icon={Mail}
          value={form.email}
          onChange={setField("email")}
          keyboardType="email-address"
        />
        <FormField
          label="Detailed Review"
          placeholder="What did you like or dislike? How was the quality?"
          icon={MessageSquare}
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
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.submitBtnText}>Submit Review</Text>
            <Send size={18} color="#fff" />
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
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
    gap: 4,
  },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
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
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
  },
  submitBtnText: {
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    fontSize: 15,
  },
});

export default AddReviewForm;
