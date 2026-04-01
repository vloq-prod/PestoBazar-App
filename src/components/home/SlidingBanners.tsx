import { View, TouchableOpacity, Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useTheme } from "../../theme";
import { BannerItem } from "../../types/home.types";
import { Image } from "expo-image";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_WIDTH = SCREEN_WIDTH * 0.84;
const ITEM_HEIGHT = ITEM_WIDTH * 0.48;

interface Props {
  data: BannerItem[];
  onBannerPress?: (banner: BannerItem) => void;
}

export default function SlidingBanners({ onBannerPress, data }: Props) {
  const { colors } = useTheme();

  if (!data?.length) return null;

  return (
    <View>
      <Carousel
        width={SCREEN_WIDTH}
        height={ITEM_HEIGHT}
        data={data}
        loop
        autoPlay
        autoPlayInterval={3500}
        scrollAnimationDuration={650}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 1,
          parallaxScrollingOffset: 70,
          parallaxAdjacentItemScale: 0.88,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => onBannerPress?.(item)}
            style={{
              width: ITEM_WIDTH,
              height: ITEM_HEIGHT,
              borderRadius: 14,
              overflow: "hidden",
              alignSelf: "center",
              backgroundColor: colors.backgroundSkeleton,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Image
              source={{ uri: item.s3_image_path }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
