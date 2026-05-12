import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../theme/tokens";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
};

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle }) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md
  },
  title: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900"
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22
  }
});
