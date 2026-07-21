import { StyleSheet, Text, View, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import React from 'react';
import { Image } from 'expo-image';
import AppNavbar from '../../src/components/comman/AppNavbar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';
import { useDealsListing } from '../../src/hooks/homeHooks';
import ItemCard from '../../src/components/comman/ItemCard';
import { useResponsive } from '../../src/utils/useResponsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DealsScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { spacing } = useResponsive();
  
  // Fetch Deals products and banner
  const { deals, banner, loading } = useDealsListing(1, 16);
  console.log(deals)

  const renderHeader = () => {
    if (!banner) return null;
    
    // Banner will take full width
    const baseUrl = "https://static-cdn.pestobazaar.com/";
    const rawUrl = banner.mobile_banner_url || banner.mobile_banner;
    if (!rawUrl) return null;

    const imageUrl = rawUrl.startsWith("http")
      ? rawUrl
      : baseUrl + (rawUrl.startsWith("/") ? rawUrl.slice(1) : rawUrl);

    console.log("Deals Banner image URL: ", imageUrl);

    return (
      <View style={{ width: SCREEN_WIDTH, marginBottom: spacing(16) }}>
        <Image 
          source={{ uri: imageUrl }}
          style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH / 2.5 }} 
          contentFit="cover"
        />
      </View>
    );
  };

  // Compute exact width for each card so the last odd item doesn't stretch
  const itemWidth = (SCREEN_WIDTH - spacing(16) * 2 - spacing(12)) / 2;

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: colors.background }}>
      <AppNavbar title="Deals Of The Day" showBack hideBorder />
      
      {loading && deals.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={deals}
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

export default DealsScreen;
const styles = StyleSheet.create({});