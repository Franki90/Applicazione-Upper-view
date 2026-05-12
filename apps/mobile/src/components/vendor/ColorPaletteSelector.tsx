import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { VendorBranding } from "../../types";
import { colors, radii, spacing } from "../../theme/tokens";

type ColorPaletteSelectorProps = {
  value: VendorBranding;
  onChange: (value: VendorBranding) => void;
};

const presets: VendorBranding[] = [
  {
    primaryColor: "#4F46E5",
    secondaryColor: "#22C55E",
    accentColor: "#06B6D4",
    backgroundColor: "#F9FAFB"
  },
  {
    primaryColor: "#0F172A",
    secondaryColor: "#F97316",
    accentColor: "#10B981",
    backgroundColor: "#F8FAFC"
  },
  {
    primaryColor: "#BE123C",
    secondaryColor: "#F59E0B",
    accentColor: "#1D4ED8",
    backgroundColor: "#FFFBEB"
  }
];

const ColorField: React.FC<{
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}> = ({ label, value, onChangeText }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.colorRow}>
      <View style={[styles.swatch, { backgroundColor: value }]} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="characters"
        autoCorrect={false}
        style={styles.input}
      />
    </View>
  </View>
);

export const ColorPaletteSelector: React.FC<ColorPaletteSelectorProps> = ({ value, onChange }) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Brand palette</Text>
      <ColorField
        label="Primary"
        value={value.primaryColor}
        onChangeText={(primaryColor) => onChange({ ...value, primaryColor })}
      />
      <ColorField
        label="Secondary"
        value={value.secondaryColor}
        onChangeText={(secondaryColor) => onChange({ ...value, secondaryColor })}
      />
      <ColorField
        label="Accent"
        value={value.accentColor}
        onChangeText={(accentColor) => onChange({ ...value, accentColor })}
      />
      <ColorField
        label="Background"
        value={value.backgroundColor}
        onChangeText={(backgroundColor) => onChange({ ...value, backgroundColor })}
      />

      <View style={styles.presets}>
        {presets.map((preset, index) => (
          <Pressable key={index} onPress={() => onChange(preset)} style={styles.preset}>
            <View style={[styles.presetSwatch, { backgroundColor: preset.primaryColor }]} />
            <View style={[styles.presetSwatch, { backgroundColor: preset.secondaryColor }]} />
            <View style={[styles.presetSwatch, { backgroundColor: preset.accentColor }]} />
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text
  },
  field: {
    gap: spacing.xs
  },
  label: {
    color: colors.textSecondary,
    fontWeight: "700",
    fontSize: 12
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: spacing.md,
    paddingVertical: 10
  },
  presets: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs
  },
  preset: {
    flexDirection: "row",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 6
  },
  presetSwatch: {
    width: 16,
    height: 16,
    borderRadius: 4
  }
});
