import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Platform,
  StatusBar,
} from "react-native";
import React, { useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Search, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../src/theme";
import LottieView from "lottie-react-native";
import searchEmpty from "../../assets/lottieview/emptySearch.json";

export default function SearchScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* ─── Header ─────────────────────────────────────────── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          gap: 10,
        }}
      >
        {/* Back Button */}
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>

        {/* Search Input Pill */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => inputRef.current?.focus()}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            height: 42,
            paddingHorizontal: 12,
            borderRadius: 5,
            backgroundColor: colors.inputBackground,
            borderWidth: 1,
            borderColor: "transparent",
            gap: 8,
          }}

          
        >
          <Search
            size={18}
            color={colors.textSecondary}
            style={{ flexShrink: 0 }}
          />

          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search products..."
            placeholderTextColor={colors.textTertiary}
            autoFocus
            returnKeyType="search"
            style={{
              flex: 1,
              height: 42,
              padding: 0,
              margin: 0,
              color: colors.text,
              fontSize: 14,
              fontFamily: "Poppins_400Regular",
              includeFontPadding: false,
              textAlignVertical: "center",
            }}
            onSubmitEditing={() => {
              if(!query.trim()) return
              router.push({
                pathname: "/(tabs)/shop",
                params:  { search: query}
              })
            }}
          />

          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ flexShrink: 0 }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: colors.textSecondary + "33",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={12} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>

      {/* ─── Empty State ─────────────────────────────────────── */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <LottieView
          source={searchEmpty}
          autoPlay
          loop
          style={{ width: 220, height: 220 }}
        />
        <Text
          style={{
            marginTop: 10,
            fontSize: 14,
            color: colors.textSecondary,
            fontFamily: "Poppins_500Medium",
          }}
        >
          No results found
        </Text>
      </View>
    </SafeAreaView>
  );
}
