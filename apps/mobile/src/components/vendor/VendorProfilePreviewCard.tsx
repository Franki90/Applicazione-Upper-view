import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { VendorProfileForm } from "../../types";
import { radii, spacing } from "../../theme/tokens";

type VendorProfilePreviewCardProps = {
  profile: VendorProfileForm;
};

export const VendorProfilePreviewCard: React.FC<VendorProfilePreviewCardProps> = ({ profile }) => {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: profile.branding.backgroundColor,
          borderColor: profile.branding.primaryColor
        }
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.logoBox, { borderColor: profile.branding.secondaryColor }]}>
          {profile.logoUrl ? <Image source={{ uri: profile.logoUrl }} style={styles.logo} resizeMode="contain" /> : null}
        </View>
        <View style={styles.meta}>
          <Text style={[styles.businessName, { color: profile.branding.primaryColor }]}>
            {profile.businessName || "Business name"}
          </Text>
          <Text style={[styles.category, { color: profile.branding.accentColor }]}>
            {profile.category || "Category"} - {profile.city || "City"}
          </Text>
        </View>
      </View>
      <Text style={styles.description}>{profile.description || "Business description preview"}</Text>
      <Text style={styles.contact}>{profile.phone || "Phone"} - {profile.email || "Email"}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  logoBox: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    overflow: "hidden"
  },
  logo: {
    width: "100%",
    height: "100%"
  },
  meta: {
    flex: 1
  },
  businessName: {
    fontWeight: "900",
    fontSize: 16
  },
  category: {
    fontSize: 12,
    fontWeight: "700"
  },
  description: {
    fontSize: 13,
    color: "#111827"
  },
  contact: {
    fontSize: 12,
    color: "#374151"
  }
});
