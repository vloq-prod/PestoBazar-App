import { useWindowDimensions } from 'react-native';


export const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  const isTablet = width >= 768;

  const wp = (percentage: number) => {
    return (width * percentage) / 100;
  };

  const hp = (percentage: number) => {
    return (height * percentage) / 100;
  };

  const getResponsiveFontSize = (size: number) => {
    return isTablet ? size * 1.2 : size;
  };

  const getResponsivePadding = (size: number) => {
    return isTablet ? size * 1.2 : size;
  };

  return {
    width,
    height,
    isTablet,
    wp,
    hp,
    getResponsiveFontSize,
    getResponsivePadding,
  };
};

