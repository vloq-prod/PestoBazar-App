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
import { MapPin, LocateFixed, Search, AlertCircle, ArrowLeft } from "lucide-react-native";
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Fullscreen Map ── */}
      <View style={StyleSheet.absoluteFillObject}>
        {/* Loading overlay */}
        {isInitializing && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Fetching your location...</Text>
          </View>
        )}

        {mapError ? (
          <View style={styles.errorOverlay}>
            <AlertCircle size={44} color="#EF4444" style={{ marginBottom: 12 }} />
            <Text style={styles.errorTitle}>Map failed to load</Text>
            <Text style={styles.errorSubtitle}>
              Please check your network connection and try again.
            </Text>
            <TouchableOpacity
              onPress={() => setMapError(false)}
              style={[styles.retryBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFillObject}
            initialRegion={{
              latitude: selectedCoords.latitude,
              longitude: selectedCoords.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            onMapReady={() => setIsInitializing(false)}
            onRegionChange={() => {
              isMoving.current = true;
            }}
            onRegionChangeComplete={(region) => {
              isMoving.current = false;
              const { latitude, longitude } = region;

              if (isMounted.current) {
                setSelectedCoords({ latitude, longitude });
              }

              if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current);

              geocodeTimeout.current = setTimeout(() => {
                const dist =
                  Math.abs(latitude - lastGeocodedCoords.current.latitude) +
                  Math.abs(longitude - lastGeocodedCoords.current.longitude);

                if (dist > 0.0001) {
                  reverseGeocode(latitude, longitude);
                }
              }, 600);
            }}
          />
        )}

        {/* ── Centre Pin (Fixed at map center) ── */}
        <View pointerEvents="none" style={styles.centerPinWrapper}>
          <Image
            source={require("../../assets/pin.png")}
            style={styles.pinImage}
          />
          <View style={[styles.pinDot, { backgroundColor: colors.primary }]} />
        </View>
      </View>

      {/* ── Top Floating Header (Back + Search Input Pill) ── */}
      <View
        style={[
          styles.topFloatingHeader,
          { paddingTop: insets.top + spacing(8) },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.back()}
          style={styles.backCircleBtn}
        >
          <ArrowLeft size={20} color="#111827" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setSearchVisible(true)}
          style={styles.floatingSearchInput}
        >
          <Text
            numberOfLines={1}
            style={styles.searchInputPlaceholder}
          >
            Search an area or address
          </Text>
          <Search size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* ── Current Location Pill (Floating above Bottom Sheet) ── */}
      <View
        style={[
          styles.currentLocationPillWrapper,
          { bottom: 200 + Math.max(insets.bottom + 24, 52) },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleCurrentLocation}
          style={styles.currentLocationPill}
        >
          {isLocating ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <LocateFixed size={18} color={colors.primary} strokeWidth={2.2} />
          )}
          <Text style={styles.currentLocationText}>Current location</Text>
        </TouchableOpacity>
      </View>

      {/* ── Bottom Delivery Location Card ── */}
      <View
        style={[
          styles.bottomSheetCard,
          {
            bottom: Math.max(insets.bottom + 24, 52),
            paddingBottom: spacing(16),
          },
        ]}
      >
        <Text style={styles.pinHintHeader}>
          Place the pin at exact delivery location
        </Text>

        <View style={styles.locationDetailRow}>
          <View style={styles.locationRedIconWrapper}>
            <MapPin size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={styles.locationTitle}>
              {title}
            </Text>
            <Text numberOfLines={2} style={styles.locationSubtitle}>
              {subtitle}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.confirmProceedBtn, { backgroundColor: colors.primary }]}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmProceedBtnText}>
            Confirm & proceed
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Search Modal ── */}
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
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  loadingText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: "#4B5563",
    marginTop: 10,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    padding: 24,
  },
  errorTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#111827",
    marginBottom: 6,
  },
  errorSubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: "#FF4500",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
  },
  centerPinWrapper: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -24,
    marginTop: -48,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 90,
  },
  pinImage: {
    width: 48,
    height: 48,
    resizeMode: "contain",
  },
  pinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4500",
    marginTop: -2,
  },
  topFloatingHeader: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 99,
  },
  backCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  floatingSearchInput: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInputPlaceholder: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
    marginRight: 8,
  },
  currentLocationPillWrapper: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 99,
  },
  currentLocationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  currentLocationText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: "#111827",
  },
  bottomSheetCard: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 99,
  },
  pinHintHeader: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#4B5563",
    marginBottom: 12,
  },
  locationDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  locationRedIconWrapper: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  locationTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
    color: "#111827",
  },
  locationSubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
    lineHeight: 16,
  },
  confirmProceedBtn: {
    backgroundColor: "#FF4500",
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmProceedBtnText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: "#FFFFFF",
  },
});
