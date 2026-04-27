import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";
import AppNavbar from "../../src/components/comman/AppNavbar";
import SearchLocationModal from "../../src/modals/SearchLocationModal";


const MapScreen = () => {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();

  const [selectedAddress, setSelectedAddress] = useState("");
const [selectedCoords, setSelectedCoords] = useState(null);

  const [searchVisible, setSearchVisible] = useState(false);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <StatusBar
        backgroundColor={colors.background}
      
      />

      {/* Header */}
      <View
        style={[
          styles.headerWrap,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <AppNavbar showBack title="Select Address" />
      </View>

      {/* Body */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: spacing(16),
          paddingTop: spacing(16),
          paddingBottom: spacing(16),
        }}
      >
        {/* Search Bar */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setSearchVisible(true)}
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              borderRadius: spacing(14),
              height: spacing(48),
              paddingHorizontal: spacing(16),
            },
          ]}
        >
          <Text
            style={{
              fontSize: font(15),
              color: colors.textSecondary,
            }}
          >
            Search location...
          </Text>
        </TouchableOpacity>

        {/* Map Placeholder */}
        <View
          style={[
            styles.mapArea,
            {
              marginTop: spacing(16),
              backgroundColor: colors.backgroundgray,
              borderColor: colors.border,
              borderRadius: spacing(18),
            },
          ]}
        >
          <Text
            style={{
              fontSize: font(16),
              color: colors.textSecondary,
            }}
          >
            Map will appear here
          </Text>
        </View>
      </View>

  <SearchLocationModal
  visible={searchVisible}
  onClose={() => setSearchVisible(false)}
  onSelectLocation={(location) => {
    console.log("Parent Data:", location);

    setSelectedAddress(location.address);
  
  }}
/>
    </SafeAreaView>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  headerWrap: {
    borderBottomWidth: 1,
  },

  searchBar: {
    borderWidth: 1,
    justifyContent: "center",
  },

  mapArea: {
    flex: 1,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});