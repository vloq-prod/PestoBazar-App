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
import { Search, X, MapPin } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

  const renderItem = ({ item }: { item: PlaceItem }) => {
    const parts = item.description.split(",");
    const title = parts[0];
    const subtitle = parts.slice(1).join(",");

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleSelect(item)}
        style={[
          styles.row,
          {
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: colors.primaryLight,
            },
          ]}
        >
          <MapPin size={16} color={colors.primary} />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: font(14),
              color: colors.text,
              fontFamily: "Poppins_500Medium",
            }}
          >
            {title}
          </Text>

          <Text
            numberOfLines={2}
            style={{
              marginTop: 2,
              fontSize: font(12),
              color: colors.textSecondary,
              fontFamily: "Poppins_400Regular",
            }}
          >
            {subtitle}
          </Text>
        </View>
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
              borderTopLeftRadius: spacing(22),
              borderTopRightRadius: spacing(22),
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
                  width: spacing(38),
                  height: spacing(38),
                  borderRadius: spacing(19),
                  backgroundColor: colors.background,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 0.5,
                  borderColor: colors.border,
                }}
              >
                <X size={18} color={colors.text} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Header */}
            <View
              style={{
                paddingHorizontal: spacing(16),
                paddingVertical: spacing(14),
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: font(16),
                  color: colors.text,
                  fontFamily: "Poppins_600SemiBold",
                }}
              >
                Search Address
              </Text>
            </View>

            {/* Search Box */}
            <View
              style={{
                paddingHorizontal: spacing(16),
                paddingTop: spacing(14),
              }}
            >
              <View
                style={{
                  height: spacing(50),
                  borderRadius: spacing(14),
                  backgroundColor: colors.backgroundgray,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: spacing(14),
                  gap: spacing(10),
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
                  }}
                />
              </View>
            </View>

            {/* Body */}
            <View
              style={{
                flex: 1,
                paddingTop: spacing(10),
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
                <FlatList
                  data={results}
                  keyExtractor={(item) => item.place_id}
                  renderItem={renderItem}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
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
              )}
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
