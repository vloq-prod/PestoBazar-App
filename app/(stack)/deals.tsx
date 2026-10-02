import { StyleSheet, Text, View, FlatList, ActivityIndicator, Dimensions, TouchableOpacity, Linking } from 'react-native';
import React from 'react';
import { Image } from 'expo-image';
import AppNavbar from '../../src/components/comman/AppNavbar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';
import { useDealsListing } from '../../src/hooks/homeHooks';
import ItemCard, { ItemCardSkeleton } from '../../src/components/comman/ItemCard';
import { useResponsive } from '../../src/utils/useResponsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DealsScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { spacing } = useResponsive();
  
  // Fetch Deals products and banner
  const { deals, banner, loading } = useDealsListing(1, 16);

  const handleBannerPress = () => {
    if (banner?.redirect) {
      Linking.openURL(banner.redirect).catch(() => {});
    }
  };

  const getBannerImageUrl = (b: any) => {
    if (!b) return null;
    const baseUrl = "https://static-cdn.pestobazaar.com/";

    // Check if s3_image_url is a direct valid CDN URL
    if (
      b.s3_image_url &&
      b.s3_image_url.startsWith("http") &&
      !b.s3_image_url.includes("localhost") &&
      !b.s3_image_url.includes("127.0.0.1")
    ) {
      return b.s3_image_url;
    }

    if (b.s3_image_path) {
      const path = b.s3_image_path;
      return path.startsWith("http")
        ? path
        : baseUrl + (path.startsWith("/") ? path.slice(1) : path);
    }

    const fileName = b.mobile_banner || b.desktop_banner;
    if (fileName) {
      if (fileName.startsWith("http")) return fileName;
      const cleanPath = fileName.startsWith("pestobazaar/")
        ? fileName
        : `pestobazaar/uploads/Banners/${fileName.replace(/^\//, "")}`;
      return baseUrl + cleanPath;
    }

    if (b.mobile_banner_url) {
      let url = b.mobile_banner_url;
      if (url.includes("localhost") || url.includes("127.0.0.1")) {
        url = url.replace(/^https?:\/\/[^\/]+/, baseUrl.replace(/\/$/, ""));
      }
      return url;
    }

    if (b.desktop_banner_url) {
      let url = b.desktop_banner_url;
      if (url.includes("localhost") || url.includes("127.0.0.1")) {
        url = url.replace(/^https?:\/\/[^\/]+/, baseUrl.replace(/\/$/, ""));
      }
      return url;
    }

    return null;
  };

  const renderHeader = () => {
    const imageUrl = getBannerImageUrl(banner);
    const bannerHeight = SCREEN_WIDTH * 0.48;

    if (!imageUrl) {
      if (loading) {
        return (
          <View 
            style={{ 
              width: SCREEN_WIDTH, 
              height: bannerHeight,
              backgroundColor: colors.backgroundSkeleton || "#E5E7EB",
              marginBottom: spacing(16),
            }}
          />
        );
      }
      return null;
    }

    return (
      <TouchableOpacity 
        activeOpacity={banner?.redirect ? 0.88 : 1}
        onPress={handleBannerPress}
        disabled={!banner?.redirect}
        style={{ 
          width: SCREEN_WIDTH, 
          height: bannerHeight,
          backgroundColor: colors.surface || "#F3F4F6",
          marginBottom: spacing(16),
        }}
      >
        <Image 
          source={{ uri: imageUrl }}
          style={{ width: "100%", height: "100%" }} 
          contentFit="cover"
          transition={300}
        />
      </TouchableOpacity>
    );
  };

  // Compute exact width for each card so the last odd item doesn't stretch
  const itemWidth = (SCREEN_WIDTH - spacing(16) * 2 - spacing(12)) / 2;
  const isSkeleton = loading && deals.length === 0;

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: colors.background }}>
      <AppNavbar title="Deals Of The Day" showBack hideBorder />
      
      <FlatList
        data={isSkeleton ? ([1, 2, 3, 4, 5, 6] as any[]) : deals}
        keyExtractor={(item, index) => (isSkeleton ? `skeleton-${index}` : String(item.id))}
        ListHeaderComponent={renderHeader}
        numColumns={2}
        contentContainerStyle={{ 
          paddingBottom: insets.bottom + spacing(20) 
        }}
        columnWrapperStyle={{
          paddingHorizontal: spacing(16),
          gap: spacing(12),
          marginBottom: spacing(16)
        }}
        renderItem={({ item }) => (
          <View style={{ width: itemWidth }}>
            {isSkeleton ? (
              <ItemCardSkeleton />
            ) : (
              <ItemCard 
                item={{
                  ...item,
                  s3_image_path: item.image_path, 
                } as any} 
              />
            )}
          </View>
        )}
      />
    </View>
  );
};

export default DealsScreen;
const styles = StyleSheet.create({});