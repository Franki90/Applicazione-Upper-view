import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radii, spacing } from "../theme/tokens";

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
};

export const AppButton: React.FC<AppButtonProps> = ({
  label,
  onPress,
  variant = "primary",
  disabled = false
}) => {
  const backgroundStyle =
    variant === "primary"
      ? styles.primary
      : variant === "secondary"
      ? styles.secondary
      : styles.ghost;

  const textStyle =
    variant === "ghost"
      ? styles.ghostText
      : variant === "secondary"
      ? styles.secondaryText
      : styles.primaryText;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        backgroundStyle,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null
      ]}
    >
      <Text style={[styles.text, textStyle]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center"
  },
  primary: {
    backgroundColor: colors.primary,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4
  },
  secondary: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border
  },
  ghost: {
    backgroundColor: "transparent"
  },
  text: {
    fontSize: 15,
    fontWeight: "700"
  },
  primaryText: {
    color: "#FFFFFF"
  },
  secondaryText: {
    color: colors.primaryDark
  },
  ghostText: {
    color: colors.textSecondary
  },
  pressed: {
    transform: [{ scale: 0.98 }]
  },
  disabled: {
    opacity: 0.5
  }
});
