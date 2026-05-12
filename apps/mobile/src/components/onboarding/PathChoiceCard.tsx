import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../../theme/tokens";

type PathChoiceCardProps = {
  title: string;
  description: string;
  cta: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  tone: "user" | "vendor";
  onPress: () => void;
};

export const PathChoiceCard: React.FC<PathChoiceCardProps> = ({
  title,
  description,
  cta,
  icon,
  tone,
  onPress
}) => {
  const isVendor = tone === "vendor";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isVendor ? styles.vendorCard : styles.userCard,
        pressed ? styles.pressed : null
      ]}
    >
      <View style={[styles.iconWrap, isVendor ? styles.vendorIcon : styles.userIcon]}>
        <MaterialCommunityIcons name={icon} size={18} color="#FFFFFF" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={[styles.cta, isVendor ? styles.vendorCta : styles.userCta]}>{cta}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs
  },
  userCard: {
    backgroundColor: "#EEF2FF",
    borderColor: "#C7D2FE"
  },
  vendorCard: {
    backgroundColor: "#ECFDF5",
    borderColor: "#BBF7D0"
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center"
  },
  userIcon: {
    backgroundColor: colors.primary
  },
  vendorIcon: {
    backgroundColor: colors.accent
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19
  },
  cta: {
    marginTop: spacing.xs,
    fontSize: 13,
    fontWeight: "800"
  },
  userCta: {
    color: colors.primaryDark
  },
  vendorCta: {
    color: "#166534"
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95
  }
});
