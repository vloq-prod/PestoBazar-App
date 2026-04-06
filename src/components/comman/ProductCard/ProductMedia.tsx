// components/ProductCard/ProductMedia.tsx

import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../../theme";
import { useResponsive } from "../../../utils/useResponsive";


interface ProductMediaProps {
  images: string[];
  cardWidth: number;
}

const THUMB_COUNT_VISIBLE = 5;

const ProductMedia: React.FC<ProductMediaProps> = ({ images, cardWidth }) => {
  const { colors } = useTheme();
  const { spacing } = useResponsive();
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<any>(null);

  const pad = spacing(8);
  const thumbW = spacing(52);
  const gap = spacing(8);
  const imgSize = cardWidth - pad * 2 - thumbW - gap;
  const hasMultiple = images.length > 1;

  const scrollTo = useCallback((index: number) => {
    setActiveIndex(index);
    carouselRef.current?.scrollTo({ index, animated: true });
  }, []);

  return (
    <View
      style={[
        styles.mediaRow,
        {
          padding: pad,
          gap,
        },
      ]}
    >
      {/* ── Carousel ── */}
      <View
        style={[
          styles.carouselWrapper,
          {
            width: imgSize,
            height: imgSize,
            borderRadius: spacing(12),
          },
        ]}
      >
        <Carousel
          ref={carouselRef}
          width={imgSize}
          height={imgSize}
          data={images}
          loop={hasMultiple}
          autoPlay={hasMultiple}
          autoPlayInterval={3200}
          scrollAnimationDuration={500}
          onSnapToItem={setActiveIndex}
          renderItem={({ item: uri }) => (
            <Image
              source={{ uri }}
              style={{ width: imgSize, height: imgSize }}
              resizeMode="cover"
            />
          )}
        />

        <LinearGradient
          colors={["transparent", "rgba(8,6,32,0.35)"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0.55 }}
          end={{ x: 0, y: 1 }}
          pointerEvents="none"
        />

        {hasMultiple && (
          <View style={styles.dotsRow} pointerEvents="none">
            {images.slice(0, THUMB_COUNT_VISIBLE).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i === activeIndex ? "#fff" : "rgba(255,255,255,0.42)",
                    width: i === activeIndex ? spacing(14) : spacing(5),
                    height: spacing(5),
                    borderRadius: spacing(3),
                  },
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* ── Thumbnails ── */}
      <View style={{ width: thumbW, maxHeight: imgSize }}>
        {hasMultiple ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing(6) }}
            nestedScrollEnabled
          >
            {images.map((uri, i) => (
              <Pressable
                key={i}
                onPress={() => scrollTo(i)}
                style={[
                  styles.thumb,
                  {
                    width: thumbW,
                    height: thumbW,
                    borderRadius: spacing(8),
                    borderColor: i === activeIndex ? colors.primary : colors.border,
                    borderWidth: i === activeIndex ? 2 : 1,
                    opacity: i === activeIndex ? 1 : 0.68,
                  },
                ]}
              >
                <Image
                  source={{ uri }}
                  style={styles.thumbImage}
                  resizeMode="cover"
                />
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
      </View>
    </View>
  );
};

export default React.memo(ProductMedia);

const styles = StyleSheet.create({
  mediaRow: {
    flexDirection: "row",
  },
  carouselWrapper: {
    overflow: "hidden",
  },
  dotsRow: {
    position: "absolute",
    bottom: 6,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
  },
  dot: {},
  thumb: {
    overflow: "hidden",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
});