import {
  Platform,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { useAppVisitorStore } from "../../store/auth";
import { useCartCount, useQuickCart } from "../../hooks/cartHooks";
import { ChevronRight } from "lucide-react-native";
import Animated, {
  Extrapolate,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

type Props = {
  visible?: SharedValue<number>;
  pbandroid?: number,
  pbios?: number,


};

const AddToCartPreview: React.FC<Props> = ({ visible, pbandroid = 12, pbios = 90 }) => {
  const router = useRouter();
  const { colors } = useTheme();
  const { spacing, font, isTablet } = useResponsive();

  const visitorId = useAppVisitorStore((state) => state.visitorId);

  const { data: quickCartData } = useQuickCart({
    user_id: 0,
    visitor_id: visitorId!,
  });

  const { data: cartCountData } = useCartCount({
    user_id: 0,
    visitor_id: visitorId!,
  });

  const items = Array.isArray(quickCartData?.data) ? quickCartData.data : [];
  const count = cartCountData?.data || 0;
  const validItems = items.filter((item: any) => item && item.s3_image_path);
  const latestItems = validItems.slice(-3);
  const hasCartPreview = count > 0 && latestItems.length > 0;
  const horizontalInset = isTablet ? spacing(24) : spacing(16);
  const imageSize = spacing(isTablet ? 26 : 40);
  const imageOverlap = spacing(isTablet ? 18 : 20);
  const hiddenTranslateY = spacing(120);
  const imageStackWidth =
    imageSize * latestItems.length -
    imageOverlap * Math.max(latestItems.length - 1, 0);
  const animatedContainerStyle = useAnimatedStyle(() => {
    const progress = visible?.value ?? 1;

    return {
      opacity: interpolate(progress, [0, 1], [0, 1], Extrapolate.CLAMP),
      transform: [
        {
          translateY: interpolate(
            progress,
            [0, 1],
            [hiddenTranslateY * 0.75, 0],
            Extrapolate.CLAMP,
          ),
        },
      ],
    };
  }, [hiddenTranslateY, visible]);

  if (!hasCartPreview) return null;
  if (!visitorId) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        animatedContainerStyle,
        {
          bottom: Platform.OS === "ios" ? spacing(pbios) : spacing(pbandroid),
          left: horizontalInset,
          right: horizontalInset,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push("/cart")}
        style={[
          styles.card,
          {
            backgroundColor: colors.primary,
            paddingVertical: spacing(5),
            paddingLeft: spacing(5),
            paddingRight: spacing(5),
            borderRadius: spacing(999),
            minHeight: spacing(32),
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.22)",
          },
        ]}
      >
        <View
          style={[
            styles.imageStack,
            {
              width: imageStackWidth,
              height: imageSize,
              marginRight: spacing(6),
            },
          ]}
        >
          {latestItems.map((item: any, index: number) => (
            <View
              key={`${item.id ?? item.product_id ?? index}-${index}`}
              style={[
                styles.imageFrame,
                {
                  width: imageSize,
                  height: imageSize,
                  borderRadius: imageSize / 2,
                  borderColor: colors.primary,
                  zIndex: index + 1,
                  marginLeft: index === 0 ? 0 : -imageOverlap,
                },
              ]}
            >
              <Image
                source={{ uri: item.s3_image_path }}
                style={{
                  width: imageSize,
                  height: imageSize,
                  borderRadius: imageSize / 2,
                }}
                resizeMode="cover"
              />
            </View>
          ))}
        </View>

        <View
          style={[
            styles.infoContainer,
            {
              marginRight: spacing(10),
            },
          ]}
        >
          <Text
            style={{
              color: colors.textOnPrimary,
              fontSize: font(13),
              fontWeight: "600",
            }}
          >
            View Cart
          </Text>

          <Text
            style={{
              color: colors.textOnPrimary,
              fontSize: font(11),
              opacity: 0.9,
            }}
          >
            {count} items added
          </Text>
        </View>

        <View
          style={[
            styles.arrowContainer,
            {
              backgroundColor: colors.background,
              width: imageSize,
              height: imageSize,
              borderRadius: imageSize / 2,
            },
          ]}
        >
          <ChevronRight size={spacing(25)} color={colors.primary} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AddToCartPreview;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 99,
    alignSelf: "center",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 9,

    elevation: 8,
  },

  imageStack: {
    flexDirection: "row",
    alignItems: "center",
  },

  image: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  imageFrame: {
    borderWidth: 1,
    overflow: "hidden",
  },

  infoContainer: {
    justifyContent: "center",
  },

  arrowContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});
