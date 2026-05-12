import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, ViewStyle } from "react-native";
import { colors, spacing } from "../theme/tokens";

type ScreenContainerProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export const ScreenContainer: React.FC<ScreenContainerProps> = ({ children, style }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.container, style]}>{children}</ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
    backgroundColor: colors.background
  }
});
