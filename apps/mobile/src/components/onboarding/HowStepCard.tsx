import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../../theme/tokens";

type HowStepCardProps = {
  step: string;
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

export const HowStepCard: React.FC<HowStepCardProps> = ({ step, title, icon }) => {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <Text style={styles.step}>{step}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      <MaterialCommunityIcons name={icon} size={20} color={colors.primaryDark} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  left: {
    gap: 2
  },
  step: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800"
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700"
  }
});
