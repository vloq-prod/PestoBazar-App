import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";

const UserInfo = () => {
  const { colors } = useTheme();
  const { spacing } = useResponsive();

  return (
    <View>
      <Text>userinfo</Text>
    </View>
  );
};

export default UserInfo;

const styles = StyleSheet.create({});
