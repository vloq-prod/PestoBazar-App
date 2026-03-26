import React from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useTheme } from "../../theme";
import { BannerItem } from "../../types/home.types";

const { width } = Dimensions.get("window");

interface Props {
  data: BannerItem[];
  onPress?: (item: BannerItem) => void;
}

export default function HomeBottomCarousel({ data, onPress }: Props) {
  const { colors } = useTheme();

  if (!data?.length) return null;

  return (
    <View style={{ marginTop: 10 }}>
      <Carousel
        width={width}
        height={160}
        data={data}
        loop
        autoPlay
        autoPlayInterval={3500}
        scrollAnimationDuration={800}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onPress?.(item)}
            style={{
              width: width * 0.92,
              height: 160,
              alignSelf: "center",
              borderRadius: 12,
              overflow: "hidden",
              backgroundColor: colors.surfaceElevated,
            }}
          >
            <Image
              source={{ uri: item.s3_image_path }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}