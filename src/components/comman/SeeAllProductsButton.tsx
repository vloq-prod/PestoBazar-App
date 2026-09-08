// src/components/comman/SeeAllProductsButton.tsx

import React from "react";
import {
  TouchableOpacity,
  Text,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Image } from "expo-image";
import { useTheme } from "../../theme";
import { ChevronRight } from "lucide-react-native";

interface SeeAllProductsButtonProps {
  products?: any[];
  onPress?: () => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const getThreeProductImageUris = (products: any[] = []): string[] => {
  const uris: string[] = [];
  if (!Array.isArray(products)) return uris;

  for (const item of products) {
    if (uris.length >= 3) break;

    let uri: string | undefined = undefined;
    if (typeof item === "string") {
      uri = item;
    } else if (item && typeof item === "object") {
      uri =
        item.s3_image_path ||
        item.s3_image_url ||
        (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : undefined) ||
        item.category_image ||
        item.image_url ||
        item.image_path ||
        item.image;
    }

    if (uri && typeof uri === "string" && uri.trim() !== "") {
      uris.push(uri.trim());
    }
  }

  return uris;
};

const SeeAllProductsButton: React.FC<SeeAllProductsButtonProps> = ({
  products = [],
  onPress,
  label = "See all products",
  style,
  textStyle,
}) => {
  const { colors } = useTheme();
  const imageUris = getThreeProductImageUris(products);

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F7FAFB",
          borderWidth: 0.7,
          borderColor: "#E2E8F0",
          borderRadius: 10,
          paddingVertical: 6,
          paddingHorizontal: 14,
          marginHorizontal: 16,
          marginVertical: 4,
          gap: 8,
        },
        style,
      ]}
    >
      {/* ── 3 Overlapping Circular Product Badges ── */}
      {imageUris.length > 0 && (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {imageUris.map((uri, idx) => (
            <View
              key={idx}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                backgroundColor: "#FFFFFF",
                marginLeft: idx === 0 ? 0 : -12,
                zIndex: idx + 1,
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={{ uri }}
                style={{ width: "85%", height: "85%" }}
                contentFit="contain"
              />
            </View>
          ))}
        </View>
      )}

      {/* ── Label Text & Arrow Icon ── */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
        <Text
          style={[
            {
              fontSize: 12.5,
              fontFamily: "Poppins_600SemiBold",
              color: "#1E293B",
              includeFontPadding: false,
            },
            textStyle,
          ]}
        >
          {label}
        </Text>
        <ChevronRight
          size={13}
          color="#1E293B"
          strokeWidth={2.6}
        />
      </View>
    </TouchableOpacity>
  );
};

export default SeeAllProductsButton;
