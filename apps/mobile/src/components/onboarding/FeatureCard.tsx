import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../../theme/tokens";

type FeatureCardProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
  tint: string;
};

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, tint }) => {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: tint }]}>
        <MaterialCommunityIcons name={icon} size={18} color="#FFFFFF" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: "#FFFFFF",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    shadowColor: "#1D4ED8",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 3
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center"
  },
  content: {
    flex: 1,
    gap: 4
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800"
  },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19
  }
});
