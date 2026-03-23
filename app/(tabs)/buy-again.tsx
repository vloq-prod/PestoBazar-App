import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../src/theme";

export default function BuyAgainScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 items-center justify-center py-10">
          <Text style={{ color: colors.text }} className="font-poppins-bold text-2xl">
            Buy Again
          </Text>
          <Text style={{ color: colors.textSecondary }} className="font-poppins text-sm mt-2">
            Reorder your previous purchases
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
