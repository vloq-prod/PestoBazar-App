import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { Search, X, MapPin, ArrowUpLeft, LocateFixed } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";

import { useTheme } from "../theme";
import { useResponsive } from "../utils/useResponsive";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (data: {
    address: string;
    latitude: number;
    longitude: number;
    placeId: string;
  }) => void;
};

type PlaceItem = {
  description: string;
  place_id: string;
};

const SearchLocationModal = ({ visible, onClose, onSelectLocation }: Props) => {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const insets = useSafeAreaInsets();

  const inputRef = useRef<TextInput>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<PlaceItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => {
        inputRef.current?.focus();
      }, 350);

      return () => clearTimeout(t);
    }
  }, [visible]);

  const searchPlaces = (text: string) => {
    setSearch(text);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (text.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          "https://maps.googleapis.com/maps/api/place/autocomplete/json",
          {
            params: {
              input: text,
              key: process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY,
              language: "en",
              components: "country:in",
            },
          },
        );

        setResults(res.data.predictions || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  console.log("api key : ", process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY)

  const handleSelect = async (item: PlaceItem) => {
    try {
      setLoading(true);

      const res = await axios.get(
        "https://maps.googleapis.com/maps/api/place/details/json",
        {
          params: {
            place_id: item.place_id,
            key: process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY,
          },
        },
      );

      const data = res.data.result;

      onSelectLocation({
        address: data.formatted_address,
        latitude: data.geometry.location.lat,
        longitude: data.geometry.location.lng,
        placeId: item.place_id,
      });

      setSearch("");
      setResults([]);
      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const res = await axios.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        {
          params: {
            latlng: `${latitude},${longitude}`,
            key: process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY,
          },
        }
      );

      const data = res.data.results[0];
      if (data) {
        onSelectLocation({
          address: data.formatted_address,
          latitude,
          longitude,
          placeId: data.place_id,
        });
        setSearch("");
        setResults([]);
        onClose();
      }
    } catch (error) {
      console.log("Error fetching current location:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: PlaceItem }) => {
    const parts = item.description.split(",");
    const title = parts[0];
    const subtitle = parts.slice(1).join(",");

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleSelect(item)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: spacing(14),
        }}
      >
        <View style={{ flex: 1, paddingRight: spacing(12) }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <MapPin size={16} color={colors.primary} />
            <Text
              numberOfLines={1}
              style={{
                fontSize: font(14),
                color: colors.text,
                fontFamily: "Poppins_500Medium",
                flex: 1,
                includeFontPadding: false,
              }}
            >
              {title}
            </Text>
          </View>
          <Text
            numberOfLines={2}
            style={{
              marginTop: 4,
              fontSize: font(12),
              color: colors.textSecondary,
              fontFamily: "Poppins_400Regular",
              includeFontPadding: false,
              lineHeight: font(16),
            }}
          >
            {subtitle.trim()}
          </Text>
        </View>

        <ArrowUpLeft size={18} color={colors.textTertiary || colors.border} />
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: colors.overlay,
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={onClose} />

          <View
            style={{
              height: "70%",
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              overflow: "visible",
            }}
          >
            {/* Floating Close */}
            <View
              style={{
                position: "absolute",
                top: -spacing(50),
                left: 0,
                right: 0,
                alignItems: "center",
                zIndex: 50,
              }}
            >
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.8}
                style={{
                  width: spacing(36),
                  height: spacing(36),
                  borderRadius: spacing(18),
                  backgroundColor: colors.background,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 0.5,
                  borderColor: colors.border,
                  elevation: 5,
                  shadowColor: "#000",
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 3 },
                }}
              >
                <X size={font(16)} color={colors.text} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Header + Search Box */}
            <View
              style={{
                paddingVertical: spacing(12),
                paddingHorizontal: spacing(16),
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: font(16),
                  fontFamily: "Poppins_600SemiBold",
                  color: colors.text,
                  includeFontPadding: false,
                  lineHeight: font(20),
                }}
              >
                Search Address
              </Text>

              {/* Search Box inside Header */}
              <View
                style={{
                  height: spacing(42),
                  borderRadius: spacing(12),
                  backgroundColor: colors.inputBackground || colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: spacing(14),
                  gap: spacing(10),
                  marginTop: 10,
                }}
              >
                <Search size={18} color={colors.textSecondary} />

                <TextInput
                  ref={inputRef}
                  value={search}
                  onChangeText={searchPlaces}
                  placeholder="Type area, city, landmark..."
                  placeholderTextColor={colors.textTertiary}
                  style={{
                    flex: 1,
                    fontSize: font(14),
                    color: colors.text,
                    fontFamily: "Poppins_400Regular",
                    includeFontPadding: false,
                    paddingVertical: 0,
                  }}
                />

                {search.length > 0 && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setSearch("");
                      setResults([]);
                    }}
                    style={{ padding: 4 }}
                  >
                    <X size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Gray Area Below Header */}
            <View style={{ flex: 1, backgroundColor: colors.backgroundgray || "#F5F5F5" }}>
              {/* Current Location (Only when not searching) */}
              {search.trim().length === 0 && (
                <TouchableOpacity
                  onPress={handleCurrentLocation}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: spacing(16),
                    paddingVertical: spacing(16),
                    gap: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    backgroundColor: colors.surface,
                  }}
                >
                  <LocateFixed size={20} color={colors.primary} />
                  <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(14), color: colors.primary, includeFontPadding: false }}>
                    Use my current location
                  </Text>
                </TouchableOpacity>
              )}

              {/* Body */}
              <View
                style={{
                  flex: 1,
                  paddingTop: spacing(16),
                  paddingBottom: Math.max(insets.bottom, spacing(16)),
                }}
              >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={{ marginTop: 30 }}
                />
              ) : (
                <View
                  style={
                    results.length > 0
                      ? {
                          borderRadius: 12,
                          backgroundColor: colors.surface,
                          marginHorizontal: spacing(16),
                          overflow: "hidden",
                        }
                      : { marginHorizontal: spacing(16) }
                  }
                >
                  <FlatList
                    data={results}
                    keyExtractor={(item) => item.place_id}
                    renderItem={renderItem}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => (
                      <View
                        style={{
                          borderBottomWidth: 1.5,
                          borderStyle: "dashed",
                          borderColor: colors.border,
                          marginHorizontal: spacing(14),
                        }}
                      />
                    )}
                    contentContainerStyle={{
                      paddingBottom: 4,
                    }}
                  ListEmptyComponent={
                    search.length > 1 ? (
                      <Text
                        style={{
                          textAlign: "center",
                          marginTop: 30,
                          color: colors.textSecondary,
                          fontSize: font(13),
                        }}
                      >
                        No locations found
                      </Text>
                    ) : null
                  }
                />
              </View>
            )}
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default SearchLocationModal;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
