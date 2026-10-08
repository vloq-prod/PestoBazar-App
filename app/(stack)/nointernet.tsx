import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NetInfo from "@react-native-community/netinfo";
import { useRouter } from "expo-router";

import LottieView from "lottie-react-native";
import { useTheme } from "../../src/theme";
import nointernent from "../../assets/lottieview/no internet.json";

const NoInternet = ({ onRetry }: { onRetry?: () => void | Promise<void> }) => {
  const { colors } = useTheme();
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);

  const handlePressRetry = async () => {
    if (isRetrying) return;
    setIsRetrying(true);

    try {
      if (onRetry) {
        await Promise.resolve(onRetry());
      } else {
        const state = await NetInfo.fetch();
        if (state.isConnected) {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace("/(tabs)");
          }
        } else {
          Alert.alert(
            "Still Offline",
            "Please turn on your Wi-Fi or Mobile Data and try again."
          );
        }
      }
    } catch {
      // ignore retry errors
    } finally {
      setTimeout(() => {
        setIsRetrying(false);
      }, 500);
    }
  };

  return (
    <SafeAreaView
      edges={["top", "bottom", "left", "right"]}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <LottieView
          source={nointernent as any}
          autoPlay
          loop
          style={styles.animation}
        />
        <Text style={[styles.title, { color: colors.text }]}>
          No Internet Connection
        </Text>

        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Please check your network connection and try again.
        </Text>

        <TouchableOpacity
          onPress={handlePressRetry}
          disabled={isRetrying}
          activeOpacity={0.8}
          style={[styles.button, { backgroundColor: colors.primary, opacity: isRetrying ? 0.7 : 1 }]}
        >
          {isRetrying ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Retry</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default NoInternet;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
    width: "100%",
  },
  animation: {
    width: 260,
    height: 260,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    marginBottom: 24,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
