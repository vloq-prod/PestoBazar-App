import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as Location from "expo-location";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";
import AppNavbar from "../../src/components/comman/AppNavbar";
import SearchLocationModal from "../../src/modals/SearchLocationModal";
import { MapPin, Navigation, Search, AlertCircle } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { useMapStore } from "../../src/store/mapStore";

// ── Helper ───────────────────────────────────────────────────────────────────
const buildAddress = (item: Location.LocationGeocodedAddress) =>
  [
    item.name,
    item.street,
    item.subregion,
    item.city,
    item.region,
    item.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

const DEFAULT_COORDS = { latitude: 19.076, longitude: 72.8777 };

// ── Component ─────────────────────────────────────────────────────────────────
const MapScreen = () => {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const router = useRouter();
  const { from, type } = useLocalSearchParams<{
    from?: string;
    type?: string;
  }>();
  const insets = useSafeAreaInsets();

  const mapRef = useRef<MapView>(null);
  const isMounted = useRef(true);

  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedCoords, setSelectedCoords] = useState(DEFAULT_COORDS);
  const [searchVisible, setSearchVisible] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [mapError, setMapError] = useState(false);

  // ── Refs for tracking ──────────────────────────────────────────────────────
  const isMoving = useRef(false);
  const geocodeTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastGeocodedCoords = useRef({ latitude: 0, longitude: 0 });

  // ── Cleanup ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current);
    };
  }, []);

  // ── Reverse geocode helper ──────────────────────────────────────────────────
  const reverseGeocode = useCallback(
    async (latitude: number, longitude: number) => {
      if (!isMounted.current) return;
      console.log("[Map] Geocoding start for:", latitude, longitude);
      try {
        const result = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        if (isMounted.current && result && result.length > 0) {
          const addr = buildAddress(result[0]);
          setSelectedAddress(addr);
          lastGeocodedCoords.current = { latitude, longitude };
          console.log("[Map] Geocoding success:", addr);
        }
      } catch (err) {
        console.error("[Map] Geocoding error:", err);
      }
    },
    [],
  );

  // ── Move camera to coords ───────────────────────────────────────────────────
  const flyTo = useCallback(
    (latitude: number, longitude: number, zoom = 16) => {
      console.log("[Map] FlyTo:", latitude, longitude);
      // Convert zoom to deltas roughly
      const latDelta = 0.01 / (zoom / 16);
      const lngDelta = 0.01 / (zoom / 16);

      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude,
              longitude,
              latitudeDelta: latDelta,
              longitudeDelta: lngDelta,
            },
            700,
          );
        }
      }, 100);
    },
    [],
  );

  // ── Auto-fetch current location on mount ───────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        console.log("[Map] Requesting permissions...");
        const { status: existingStatus } =
          await Location.getForegroundPermissionsAsync();
        console.log("[Map] Existing permission status:", existingStatus);

        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
          console.log("[Map] Requesting fresh permissions...");
          const { status } = await Location.requestForegroundPermissionsAsync();
          finalStatus = status;
        }

        console.log("[Map] Final permission status:", finalStatus);
        if (finalStatus !== "granted") {
          console.log("[Map] Permission denied");
          if (isMounted.current) setIsInitializing(false);
          return;
        }

        console.log("[Map] Fetching current position...");
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = loc.coords;
        if (isMounted.current) {
          setSelectedCoords({ latitude, longitude });
          flyTo(latitude, longitude);
          await reverseGeocode(latitude, longitude);
        }
      } catch (err) {
        console.error("[Map] Initial position error:", err);
      } finally {
        if (isMounted.current) setIsInitializing(false);
      }
    })();
  }, []);

  // ── "Current Location" button handler ──────────────────────────────────────
  const handleCurrentLocation = useCallback(async () => {
    if (isLocating) return;
    setIsLocating(true);
    console.log("[Map] Manual location fetch...");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("[Map] Permission denied for manual fetch");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = loc.coords;
      if (isMounted.current) {
        setSelectedCoords({ latitude, longitude });
        flyTo(latitude, longitude);
        await reverseGeocode(latitude, longitude);
      }
    } catch (err) {
      console.error("[Map] Manual location error:", err);
    } finally {
      if (isMounted.current) setIsLocating(false);
    }
  }, [isLocating, flyTo, reverseGeocode]);

  // ── Address display helpers ─────────────────────────────────────────────────
  const parts = selectedAddress ? selectedAddress.split(",") : [];
  const title = parts.length ? parts[0] : "Selected Location";
  const subtitle = parts.length
    ? parts.slice(1).join(",")
    : "Choose your address";

  // ── Confirm handler ─────────────────────────────────────────────────────────
  const handleConfirm = useCallback(() => {
    console.log("[Map] Confirming location:", selectedCoords);
    useMapStore.getState().setSelectedLocation({
      address: selectedAddress,
      latitude: selectedCoords.latitude,
      longitude: selectedCoords.longitude,
    });
    if (from === "address" || from === "checkout") {
      router.replace({
        pathname: "/addaddress",
        params: { type: type ?? "delivery" },
      });
    } else {
      router.back();
    }
  }, [selectedAddress, selectedCoords, from, type]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar backgroundColor={colors.background} />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View
        style={[
          styles.headerWrap,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <AppNavbar showBack title="Select Location" />
      </View>

      {/* ── Search Bar ─────────────────────────────────────────────────── */}
      <View style={{ paddingHorizontal: spacing(16), paddingTop: spacing(14) }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setSearchVisible(true)}
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.cardBackground ?? colors.surface,
              borderColor: colors.border,
              borderRadius: spacing(14),
              height: spacing(48),
              paddingHorizontal: spacing(16),
              gap: spacing(10),
            },
          ]}
        >
          <Search size={16} color={colors.textTertiary} />
          <Text
            style={{
              fontFamily: "Poppins_400Regular",
              fontSize: font(14),
              color: colors.textTertiary,
              flex: 1,
            }}
          >
            Search location...
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Map Area ───────────────────────────────────────────────────── */}
      <View style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            marginTop: spacing(14),
            borderRadius: spacing(18),
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Loading overlay */}
          {isInitializing && (
            <View
              style={[
                StyleSheet.absoluteFillObject,
                {
                  backgroundColor: colors.background + "CC",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 100,
                },
              ]}
            >
              <ActivityIndicator size="large" color={colors.primary} />
              <Text
                style={{
                  fontFamily: "Poppins_500Medium",
                  fontSize: font(13),
                  color: colors.textSecondary,
                  marginTop: spacing(10),
                }}
              >
                Fetching your location...
              </Text>
            </View>
          )}

          {mapError ? (
            <View
              style={[
                StyleSheet.absoluteFillObject,
                {
                  backgroundColor: colors.surface,
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 100,
                  padding: 24,
                },
              ]}
            >
              <AlertCircle
                size={48}
                color={colors.error || "#ff4d4f"}
                style={{ marginBottom: 16 }}
              />
              <Text
                style={{
                  fontFamily: "Poppins_600SemiBold",
                  fontSize: font(16),
                  color: colors.text,
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                Map failed to load
              </Text>
              <Text
                style={{
                  fontFamily: "Poppins_400Regular",
                  fontSize: font(13),
                  color: colors.textSecondary,
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                This could be due to a poor internet connection or missing API
                configuration.
              </Text>
              <TouchableOpacity
                onPress={() => setMapError(false)}
                style={{
                  marginTop: 20,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: colors.primary,
                }}
              >
                <Text
                  style={{ color: "#fff", fontFamily: "Poppins_600SemiBold" }}
                >
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={{ width: "100%", height: "100%" }}
              initialRegion={{
                latitude: selectedCoords.latitude,
                longitude: selectedCoords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onMapReady={() => {
                console.log("[Map] Map Ready");
                setIsInitializing(false);
              }}
              onRegionChange={() => {
                isMoving.current = true;
              }}
              onRegionChangeComplete={(region) => {
                console.log(
                  "[Map] Region changed:",
                  region.latitude,
                  region.longitude,
                );
                isMoving.current = false;
                const { latitude, longitude } = region;

                if (isMounted.current) {
                  setSelectedCoords({ latitude, longitude });
                }

                // Debounce Reverse Geocoding
                if (geocodeTimeout.current)
                  clearTimeout(geocodeTimeout.current);

                geocodeTimeout.current = setTimeout(() => {
                  const dist =
                    Math.abs(latitude - lastGeocodedCoords.current.latitude) +
                    Math.abs(longitude - lastGeocodedCoords.current.longitude);

                  if (dist > 0.0001) {
                    reverseGeocode(latitude, longitude);
                  }
                }, 800); // Debounce after 800ms for stability
              }}
              onPress={(e) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                if (isMounted.current) {
                  setSelectedCoords({ latitude, longitude });
                }
                // user manually tapped, let the region change handle the geocode via debounce
              }}
            />
          )}

          {/* Centre pin */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              marginLeft: -28,
              marginTop: -72,
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999,
              elevation: 20,
            }}
          >
            <Image
              source={require("../../assets/pin.png")}
              style={{ width: 56, height: 56, resizeMode: "contain" }}
            />
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 11,
                marginTop: -4,
                backgroundColor: "rgba(255,255,255,0.95)",
                borderWidth: 3,
                borderColor: colors.primary,
                shadowColor: "#000",
                shadowOpacity: 0.16,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 3 },
                elevation: 8,
              }}
            />
          </View>

          {/* ── Current Location FAB ──────────────────────────────────── */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleCurrentLocation}
            style={[
              styles.locationFab,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: "#000",
                right: spacing(14),
                bottom:
                  spacing(14) + (insets.bottom > 0 ? insets.bottom - 10 : 0),
              },
            ]}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Navigation size={20} color={colors.primary} strokeWidth={2.2} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Bottom Card ────────────────────────────────────────────────── */}
      <View
        style={[
          styles.bottomCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            left: 0,
            right: 0,
            bottom: 0,
            borderTopLeftRadius: spacing(20),
            borderTopRightRadius: spacing(20),
            padding: spacing(16),
            paddingBottom:
              insets.bottom > 0 ? insets.bottom + spacing(10) : spacing(20),
          },
        ]}
      >
        {/* Address preview */}
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: colors.primaryLight ?? colors.primary + "18",
              marginRight: 12,
            }}
          >
            <MapPin size={18} color={colors.primary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: "Poppins_600SemiBold",
                fontSize: font(14),
                color: colors.text,
              }}
            >
              {title}
            </Text>
            <Text
              numberOfLines={2}
              style={{
                marginTop: 3,
                fontFamily: "Poppins_400Regular",
                fontSize: font(12),
                color: colors.textSecondary,
                lineHeight: font(17),
              }}
            >
              {subtitle}
            </Text>
          </View>
        </View>

        {/* Confirm button */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={{
            marginTop: spacing(14),
            height: spacing(50),
            borderRadius: spacing(14),
            backgroundColor: colors.primary,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={handleConfirm}
        >
          <Text
            style={{
              fontFamily: "Poppins_700Bold",
              color: colors.textOnPrimary ?? "#fff",
              fontSize: font(15),
            }}
          >
            Confirm Location
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Search Modal ───────────────────────────────────────────────── */}
      <SearchLocationModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        onSelectLocation={(location) => {
          if (location.latitude != null && location.longitude != null) {
            const newCoords = {
              latitude: location.latitude,
              longitude: location.longitude,
            };
            setSelectedAddress(location.address || "");
            setSelectedCoords(newCoords);
            flyTo(newCoords.latitude, newCoords.longitude, 17);
          }
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
    flexDirection: "row",
    alignItems: "center",
  },
  bottomCard: {
    position: "absolute",
    borderTopWidth: 1,
  },
  locationFab: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
