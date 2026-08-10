import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import AppNavbar from '../../src/components/comman/AppNavbar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';
import { useResponsive } from '../../src/utils/useResponsive';
import { Heart } from 'lucide-react-native';

const WishlistScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: colors.background }}>
      <AppNavbar title="My Wishlist" showBack hideBorder />
      
      <View style={styles.centerContainer}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primary + "12" }]}>
          <Heart size={48} color={colors.primary} fill={colors.primary + "30"} />
        </View>
        <Text style={[styles.title, { color: colors.text, fontSize: font(20) }]}>
          Wishlist Coming Soon
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: font(14) }]}>
          We are currently working on this feature. You will soon be able to save your favorite products here!
        </Text>
      </View>
    </View>
  );
};

export default WishlistScreen;

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },
});
