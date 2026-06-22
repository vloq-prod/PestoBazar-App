import { StyleSheet, Text, View, FlatList, ActivityIndicator, Dimensions, Image } from 'react-native';
import React from 'react';
import AppNavbar from '../../src/components/comman/AppNavbar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';
import { useDiyListing } from '../../src/hooks/diyHooks';
import ItemCard from '../../src/components/comman/ItemCard';
import { useResponsive } from '../../src/utils/useResponsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DiyScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { spacing } = useResponsive();
  
  // Fetch DIY products and banner
  const { products, banner, loading } = useDiyListing({});

  const renderHeader = () => {
    if (!banner) return null;
    
    // Banner will take full width
    const imageUrl = banner.mobile_banner_url;
    console.log("image Url: ", imageUrl)
    if (!imageUrl) return null;

    return (
      <View style={{ width: SCREEN_WIDTH, marginBottom: spacing(16) }}>
        <Image 
          source={{ uri: imageUrl }}
          style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH / 2.5 }} 
          resizeMode="cover"
        />
      </View>
    );
  };

  // Compute exact width for each card so the last odd item doesn't stretch
  const itemWidth = (SCREEN_WIDTH - spacing(16) * 2 - spacing(12)) / 2;

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: colors.background }}>
      <AppNavbar title="Do It Yourself" showBack hideBorder />
      
      {loading && products.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
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
