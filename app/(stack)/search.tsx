import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StatusBar,
  ScrollView,
  Image,
} from "react-native";
import React, { useState, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Search, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../src/theme";
import LottieView from "lottie-react-native";
import searchEmpty from "../../assets/lottieview/emptySearch.json";
import SearchItem from "../../src/components/search/SearchItem";
import { useSearchSuggestions } from "../../src/hooks/searchHooks";
import SearchItemSkeleton from "../../src/skeleton/SearchItemSkeleton";

export default function SearchScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");

  const { data, isLoading, isError } = useSearchSuggestions(query);
  const results = data?.data?.result ?? [];
  const productResults = results.filter(
    (item: any) => item?.search_type === "product",
  );
  const categoryResults = results.filter(
    (item: any) => item?.search_type === "category",
  );
  const hasResults = productResults.length > 0 || categoryResults.length > 0;
  const showEmptyState =
    !isLoading && !isError && query.trim().length > 0 && !hasResults;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
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
              if (!query.trim()) return;
              router.push({
                pathname: "/(tabs)/shop",
                params: { search: query },
              });
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

      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        bounces={hasResults}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: Math.max(insets.bottom, 16),
        }}
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <SearchItemSkeleton key={`search-skeleton-${index}`} />
            ))
          : null}

        {isError ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 32,
            }}
          >
            <Text
              style={{
                color: colors.textSecondary,
                fontFamily: "Poppins_500Medium",
                fontSize: 13,
              }}
            >
              Something went wrong
            </Text>
          </View>
        ) : null}

        {showEmptyState ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 24,
            }}
          >
            <LottieView
              source={searchEmpty}
              autoPlay
              loop
              style={{ width: 180, height: 180 }}
            />
            <Text
              style={{
                marginTop: 8,
                color: colors.text,
                fontFamily: "Poppins_600SemiBold",
                fontSize: 15,
                textAlign: "center",
              }}
            >
              No products found
            </Text>
            <Text
              style={{
                marginTop: 4,
                color: colors.textSecondary,
                fontFamily: "Poppins_400Regular",
                fontSize: 12,
                textAlign: "center",
              }}
            >
              Try searching with another product name or size.
            </Text>
          </View>
        ) : null}

        {!isLoading && !isError && productResults.length > 0 ? (
          <View>
            {productResults.map((item, index) => (
              <SearchItem key={`${item.product_url}-${index}`} item={item} />
            ))}
          </View>
        ) : null}

        {!isLoading && !isError && categoryResults.length > 0 ? (
          <View style={{ marginTop: productResults.length > 0 ? 20 : 8 }}>
            <Text
              style={{
                fontFamily: "Poppins_600SemiBold",
                fontSize: 14,
                color: colors.text,
                marginBottom: 12,
              }}
            >
              Categories
            </Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                rowGap: 12,
              }}
            >
              {categoryResults.map((item: any, index: number) => (
                <TouchableOpacity
                  key={`${item.product_url}-${index}`}
                  activeOpacity={0.8}
                  onPress={() => {
                    router.push({
                      pathname: "/(tabs)/shop",
                      params: { search: item.product_name },
                    });
                  }}
                  style={{
                    width: "48%",
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 14,
                    backgroundColor: colors.inputBackground,
                    padding: 12,
                  }}
                >
                  <View
                    style={{
                      width: "100%",
                      aspectRatio: 1.25,
                      borderRadius: 12,
                      backgroundColor: colors.backgroundgray,
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      source={{ uri: item.image_path }}
                      style={{
                        width: "82%",
                        height: "82%",
                      }}
                      resizeMode="contain"
                    />
                  </View>

                  <Text
                    numberOfLines={2}
                    style={{
                      marginTop: 10,
                      color: colors.text,
                      fontFamily: "Poppins_600SemiBold",
                      fontSize: 12.5,
                      lineHeight: 18,
                    }}
                  >
                    {item.product_name}
                  </Text>

                  <Text
                    style={{
                      marginTop: 2,
                      color: colors.textSecondary,
                      fontFamily: "Poppins_400Regular",
                      fontSize: 10.5,
                      lineHeight: 15,
                    }}
                  >
                    Browse category
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
