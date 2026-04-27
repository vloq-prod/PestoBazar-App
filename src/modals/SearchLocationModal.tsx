import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useTheme } from "../theme";
import { useResponsive } from "../utils/useResponsive";

import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (data: any) => void;
};

const SearchLocationModal = ({ visible, onClose, onSelectLocation }: Props) => {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.wrap}>
          <Pressable
            style={[
              styles.overlay,
              {
                backgroundColor: colors.overlay,
              },
            ]}
            onPress={onClose}
          />

          <View
            style={[
              styles.box,
              {
                backgroundColor: colors.surface,
                padding: spacing(18),
                borderTopLeftRadius: spacing(24),
                borderTopRightRadius: spacing(24),
              },
            ]}
          >
            <View
              style={[
                styles.dragBar,
                {
                  backgroundColor: colors.borderStrong,
                  marginBottom: spacing(18),
                },
              ]}
            />

            <Text
              style={{
                fontSize: font(18),
                fontWeight: "700",
                color: colors.text,
                marginBottom: spacing(14),
              }}
            >
              Search Address
            </Text>
            <GooglePlacesAutocomplete
              placeholder="Type area, city..."
              fetchDetails={true}
              enablePoweredByContainer={false}
              keyboardShouldPersistTaps="handled"
              listViewDisplayed="auto"
              nearbyPlacesAPI="GooglePlacesSearch"
              debounce={300}
              query={{
                key: process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY,
                language: "en",
                components: "country:in",
              }}
              onPress={(data, details) => {
                const payload = {
                  address: details?.formatted_address,
                  latitude: details?.geometry?.location?.lat,
                  longitude: details?.geometry?.location?.lng,
                  placeId: data.place_id,
                };

                console.log("Selected:", payload);

                onSelectLocation(payload);
                onClose();
              }}
              textInputProps={{
                placeholderTextColor: colors.textTertiary,
              }}
              styles={{
                container: {
                  flex: 0,
                  zIndex: 9999,
                },

                textInputContainer: {
                  backgroundColor: "transparent",
                  padding: 0,
                  margin: 0,
                },

                textInput: {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                  height: spacing(54),
                  borderRadius: spacing(14),
                  paddingHorizontal: spacing(16),
                  fontSize: font(15),
                  borderWidth: 1,
                },

                listView: {
                  backgroundColor: colors.surface,
                  borderRadius: spacing(14),
                  marginTop: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  zIndex: 9999,
                  elevation: 10,
                },

                row: {
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  backgroundColor: colors.surface,
                },

                description: {
                  color: colors.text,
                  fontSize: font(14),
                },

                separator: {
                  height: 1,
                  backgroundColor: colors.border,
                },
              }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default SearchLocationModal;

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "flex-end",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  box: {
    minHeight: 280,
  },

  dragBar: {
    width: 52,
    height: 5,
    borderRadius: 50,
    alignSelf: "center",
  },

  input: {
    borderWidth: 1,
  },
});
