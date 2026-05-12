import React, { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AppButton } from "../../components/AppButton";
import { CategorySelector } from "../../components/CategorySelector";
import { ScreenContainer } from "../../components/ScreenContainer";
import { ColorPaletteSelector } from "../../components/vendor/ColorPaletteSelector";
import { LogoUploadField } from "../../components/vendor/LogoUploadField";
import { VendorProfilePreviewCard } from "../../components/vendor/VendorProfilePreviewCard";
import {
  createVendorProfileApi,
  getVendorDashboardApi,
  getVendorProfileApi,
  updateVendorProfileApi,
  uploadVendorLogoApi
} from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { colors, radii, spacing } from "../../theme/tokens";
import { VendorProfileForm } from "../../types";

const defaultProfile: VendorProfileForm = {
  businessName: "",
  description: "",
  category: "",
  categoryIds: [],
  address: "",
  city: "Lugano",
  area: "",
  phone: "",
  email: "",
  website: "",
  socialLinks: "",
  openingHours: "mon:09:00-18:00\ntue:09:00-18:00\nwed:09:00-18:00",
  logoUrl: "",
  branding: {
    primaryColor: "#4F46E5",
    secondaryColor: "#22C55E",
    accentColor: "#06B6D4",
    backgroundColor: "#F9FAFB"
  }
};

const recordToInline = (record?: Record<string, string> | null): string => {
  if (!record) return "";
  return Object.entries(record)
    .map(([key, value]) => `${key}:${value}`)
    .join(", ");
};

const recordToLines = (record?: Record<string, string> | null): string => {
  if (!record) return "";
  return Object.entries(record)
    .map(([key, value]) => `${key}:${value}`)
    .join("\n");
};

export const VendorOnboardingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { token, role } = useAuthStore((state) => ({
    token: state.token,
    role: state.role
  }));
  const [profile, setProfile] = useState<VendorProfileForm>(defaultProfile);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [logoSaving, setLogoSaving] = useState(false);

  useEffect(() => {
    if (!token || role !== "vendor") {
      return;
    }

    const load = async () => {
      try {
        const dashboard = await getVendorDashboardApi(token);
        setVendorId(dashboard.vendor.id);

        const vendor = await getVendorProfileApi(token, dashboard.vendor.id);
        setProfile({
          businessName: vendor.businessName,
          description: vendor.description ?? "",
          category: vendor.category ?? vendor.categoryIds[0] ?? "",
          categoryIds: vendor.categoryIds ?? [],
          address: vendor.address ?? "",
          city: vendor.city,
          area: vendor.area ?? "",
          phone: vendor.phone ?? "",
          email: vendor.email ?? "",
          website: vendor.website ?? "",
          socialLinks: recordToInline(vendor.socialLinks ?? undefined),
          openingHours: recordToLines(vendor.openingHours ?? undefined),
          logoUrl: vendor.logoUrl ?? "",
          branding: {
            primaryColor: vendor.primaryColor,
            secondaryColor: vendor.secondaryColor,
            accentColor: vendor.accentColor,
            backgroundColor: vendor.backgroundColor
          }
        });
      } catch (_error) {
        // Keep default profile on first onboarding.
      }
    };

    void load();
  }, [token, role]);

  const profileCompletion = useMemo(() => {
    const required = [
      profile.businessName,
      profile.description,
      profile.address,
      profile.city,
      profile.phone,
      profile.email,
      profile.logoUrl
    ];
    const baseCompletion = required.filter((item) => item.trim().length > 0).length;
    const categoriesScore = profile.categoryIds.length > 0 ? 1 : 0;
    return Math.round(((baseCompletion + categoriesScore) / (required.length + 1)) * 100);
  }, [profile]);

  const onSave = async () => {
    if (!token || role !== "vendor") {
      Alert.alert("Vendor only", "Switch to a vendor account to edit this screen.");
      return;
    }

    if (profile.categoryIds.length === 0) {
      Alert.alert("Missing categories", "Select at least one business category.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...profile,
        category: profile.categoryIds[0]
      };

      if (vendorId) {
        await updateVendorProfileApi(token, vendorId, payload);
      } else {
        const created = await createVendorProfileApi(token, payload);
        setVendorId(created.id);
      }
      Alert.alert("Saved", "Vendor profile updated successfully.");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Unable to save vendor profile");
    } finally {
      setLoading(false);
    }
  };

  const onSaveLogo = async () => {
    if (!token || role !== "vendor" || !profile.logoUrl) return;
    setLogoSaving(true);
    try {
      await uploadVendorLogoApi(token, profile.logoUrl);
      Alert.alert("Logo saved", "Logo uploaded for your vendor profile.");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Unable to save logo");
    } finally {
      setLogoSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Vendor profile</Text>
      <Text style={styles.subtitle}>Completion: {profileCompletion}%</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Business name</Text>
        <TextInput value={profile.businessName} onChangeText={(value) => setProfile({ ...profile, businessName: value })} style={styles.input} />
        <Text style={styles.label}>Description</Text>
        <TextInput
          value={profile.description}
          onChangeText={(value) => setProfile({ ...profile, description: value })}
          multiline
          style={[styles.input, styles.textArea]}
        />
        <Text style={styles.label}>Business categories (max 5)</Text>
        <CategorySelector
          selectedIds={profile.categoryIds}
          onChange={(categoryIds) => setProfile({ ...profile, categoryIds, category: categoryIds[0] ?? "" })}
          maxSelection={5}
        />
        <Text style={styles.label}>Address</Text>
        <TextInput value={profile.address} onChangeText={(value) => setProfile({ ...profile, address: value })} style={styles.input} />
        <View style={styles.row}>
          <TextInput
            value={profile.city}
            onChangeText={(value) => setProfile({ ...profile, city: value })}
            placeholder="City"
            style={[styles.input, styles.half]}
          />
          <TextInput
            value={profile.area}
            onChangeText={(value) => setProfile({ ...profile, area: value })}
            placeholder="Area"
            style={[styles.input, styles.half]}
          />
        </View>
        <View style={styles.row}>
          <TextInput
            value={profile.phone}
            onChangeText={(value) => setProfile({ ...profile, phone: value })}
            placeholder="Phone"
            style={[styles.input, styles.half]}
          />
          <TextInput
            value={profile.email}
            onChangeText={(value) => setProfile({ ...profile, email: value })}
            placeholder="Business email"
            autoCapitalize="none"
            style={[styles.input, styles.half]}
          />
        </View>
        <TextInput
          value={profile.website}
          onChangeText={(value) => setProfile({ ...profile, website: value })}
          placeholder="Website"
          autoCapitalize="none"
          style={styles.input}
        />
        <TextInput
          value={profile.socialLinks}
          onChangeText={(value) => setProfile({ ...profile, socialLinks: value })}
          placeholder="instagram:@yourpage, facebook:page"
          style={styles.input}
        />
        <TextInput
          value={profile.openingHours}
          onChangeText={(value) => setProfile({ ...profile, openingHours: value })}
          placeholder="mon:09:00-18:00"
          multiline
          style={[styles.input, styles.textArea]}
        />
      </View>

      <LogoUploadField
        logoUrl={profile.logoUrl}
        onChange={(logoUrl) => setProfile({ ...profile, logoUrl })}
        onUpload={onSaveLogo}
        loading={logoSaving}
      />

      <ColorPaletteSelector value={profile.branding} onChange={(branding) => setProfile({ ...profile, branding })} />

      <View style={styles.previewCard}>
        <Text style={styles.previewTitle}>Live business card preview</Text>
        <VendorProfilePreviewCard profile={profile} />
      </View>

      <AppButton label={loading ? "Saving..." : "Save vendor profile"} onPress={onSave} />
      <AppButton label="Back to dashboard" variant="ghost" onPress={() => navigation.goBack()} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.md
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  label: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 12
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: spacing.md,
    paddingVertical: 10
  },
  textArea: {
    minHeight: 72,
    textAlignVertical: "top"
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm
  },
  half: {
    flex: 1
  },
  previewCard: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm
  },
  previewTitle: {
    color: colors.text,
    fontWeight: "800"
  }
});
