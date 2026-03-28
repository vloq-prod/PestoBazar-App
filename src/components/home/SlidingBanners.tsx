
import {
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useTheme } from "../../theme";
import { BannerItem } from "../../types/home.types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_WIDTH = SCREEN_WIDTH * 0.96;
const ITEM_HEIGHT = ITEM_WIDTH;
interface Props {
  data: BannerItem[];
  onBannerPress?: (banner: BannerItem) => void;
}

export default function SlidingBanners({ onBannerPress, data }: Props) {
  const { colors } = useTheme();

  return (
    <View >
      <Carousel
        width={SCREEN_WIDTH}
        height={ITEM_HEIGHT}
        data={data}
        loop
        autoPlay
        autoPlayInterval={3000}
        scrollAnimationDuration={800}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.92,
          parallaxScrollingOffset: 50,
          parallaxAdjacentItemScale: 0.85,
        }}
        
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onBannerPress?.(item)}
            style={{
              width: ITEM_WIDTH,
              height: ITEM_HEIGHT,
              borderRadius: 8,
              overflow: "hidden",
              alignSelf: "center",
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
