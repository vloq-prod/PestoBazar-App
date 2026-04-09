import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LottieView from "lottie-react-native";
import { useTheme } from "../../src/theme";
import nointernent from "../../assets/lottieview/no internet.json";

const NoInternet = ({ onRetry }: { onRetry?: () => void }) => {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      edges={["top", "bottom", "left", "right"]}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
      <LottieView
        source={nointernent as any}
        autoPlay

        style={styles.animation}
      />
      <Text style={styles.title}>
        No Internet Connection
      </Text>

      <Text style={styles.description}>
        Please check your network and try again.
      </Text>

      <TouchableOpacity
        onPress={onRetry}
        style={[styles.button, { backgroundColor: colors.primary }]}
      >
        <Text style={{ color: "#fff" }}>Retry</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 24,
    width: "100%",
  },
  animation: {
    width: 300,
    height: 300,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 8,
  },
});
