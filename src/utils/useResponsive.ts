import { useWindowDimensions, PixelRatio } from "react-native";

const BASE_WIDTH = 375;

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  const isTablet = width >= 768;

  // Core scaling
  const scale = (size: number) => (width / BASE_WIDTH) * size;

  // Balanced scaling (important)
  const moderateScale = (size: number, factor = 0.5) => {
    return size + (scale(size) - size) * factor;
  };

  // Font (pixel perfect + accessibility safe)
  const font = (size: number) => {
    const newSize = moderateScale(size);
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  };

  // Spacing
  const spacing = (size: number) => moderateScale(size);

  // Optional helpers
  const wp = (percentage: number) => (width * percentage) / 100;
  const hp = (percentage: number) => (height * percentage) / 100;

  return {
    width,
    height,
    isTablet,

    scale,
    moderateScale,
    font,
    spacing,

    wp,
    hp,
  };
};