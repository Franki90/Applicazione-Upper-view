import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../../theme/tokens";

type TrustStatCardProps = {
  value: string;
  label: string;
};

export const TrustStatCard: React.FC<TrustStatCardProps> = ({ value, label }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: "31%",
    backgroundColor: "#FFFFFF",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    gap: 4
  },
  value: {
    color: colors.primaryDark,
    fontSize: 19,
    fontWeight: "900"
  },
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16
  }
});
