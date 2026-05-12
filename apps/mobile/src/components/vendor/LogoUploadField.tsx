import React from "react";
import { Image, StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "../AppButton";
import { colors, radii, spacing } from "../../theme/tokens";

type LogoUploadFieldProps = {
  logoUrl: string;
  onChange: (value: string) => void;
  onUpload: () => void;
  loading?: boolean;
};

export const LogoUploadField: React.FC<LogoUploadFieldProps> = ({
  logoUrl,
  onChange,
  onUpload,
  loading = false
}) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Business logo</Text>
      {logoUrl ? (
        <View style={styles.previewBox}>
          <Image source={{ uri: logoUrl }} style={styles.preview} resizeMode="contain" />
        </View>
      ) : (
        <View style={[styles.previewBox, styles.emptyPreview]}>
          <Text style={styles.emptyText}>Add a logo URL to preview it</Text>
        </View>
      )}
      <TextInput
        value={logoUrl}
        onChangeText={onChange}
        placeholder="https://your-domain/logo.png"
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
      <AppButton label={loading ? "Saving logo..." : "Save logo"} onPress={onUpload} variant="secondary" />
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
  previewBox: {
    height: 120,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  preview: {
    width: "100%",
    height: "100%"
  },
  emptyPreview: {
    backgroundColor: colors.background
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 12
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: spacing.md,
    paddingVertical: 11
  }
});
