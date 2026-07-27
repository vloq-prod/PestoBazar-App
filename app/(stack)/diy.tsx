import { StyleSheet, Text, View, FlatList, ActivityIndicator, Dimensions, TouchableOpacity, Linking } from 'react-native';
import React from 'react';
import { Image } from 'expo-image';
import AppNavbar from '../../src/components/comman/AppNavbar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';
import { useDiyListing } from '../../src/hooks/diyHooks';
import ItemCard, { ItemCardSkeleton } from '../../src/components/comman/ItemCard';
import { useResponsive } from '../../src/utils/useResponsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DiyScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { spacing } = useResponsive();
  
  // Fetch DIY products and banner
  const { products, banner, loading } = useDiyListing({});

  const handleBannerPress = () => {
    if (banner?.redirect) {
      Linking.openURL(banner.redirect).catch((err) =>
        console.error("Failed to open banner redirect URL:", err)
      );
    }
  };

  const renderHeader = () => {
    if (!banner) return null;
    
    const baseUrl = "https://static-cdn.pestobazaar.com/";
    const rawUrl =
      banner.s3_image_url ||
      banner.mobile_banner_url ||
      banner.desktop_banner_url ||
      banner.mobile_banner ||
      banner.s3_image_path;

    if (!rawUrl) return null;

    const imageUrl = rawUrl.startsWith("http")
      ? rawUrl
      : baseUrl + (rawUrl.startsWith("/") ? rawUrl.slice(1) : rawUrl);

    return (
      <TouchableOpacity 
        activeOpacity={banner.redirect ? 0.8 : 1}
        onPress={handleBannerPress}
        disabled={!banner.redirect}
        style={{ width: SCREEN_WIDTH, marginBottom: spacing(16) }}
      >
        <Image 
          source={{ uri: imageUrl }}
          style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH / 2 }} 
          contentFit="cover"
        />
      </TouchableOpacity>
    );
  };

  // Compute exact width for each card so the last odd item doesn't stretch
  const itemWidth = (SCREEN_WIDTH - spacing(16) * 2 - spacing(12)) / 2;

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: colors.background }}>
      <AppNavbar title="Do It Yourself" showBack hideBorder />
      
      {loading && products.length === 0 ? (
        <View 
          style={{ 
            paddingHorizontal: spacing(16), 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            gap: spacing(12),
            paddingTop: spacing(16),
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((key) => (
            <View key={key} style={{ width: itemWidth, marginBottom: spacing(16) }}>
              <ItemCardSkeleton />
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
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
              <ItemCard 
                 item={{
                     ...item,
                     s3_image_path: item.image_path, 
                 } as any} 
              />
            </View>
          )}
        />
      )}
    </View>
  );
};

export default DiyScreen;
const styles = StyleSheet.create({});
