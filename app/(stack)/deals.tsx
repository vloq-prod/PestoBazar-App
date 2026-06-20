import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import AppNavbar from '../../src/components/comman/AppNavbar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';

const DealsScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: colors.background }}>
      <AppNavbar title="PestoBazar" showBack hideBorder />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.text }}>Deals coming soon!</Text>
      </View>
    </View>
  );
};

export default DealsScreen;
const styles = StyleSheet.create({});