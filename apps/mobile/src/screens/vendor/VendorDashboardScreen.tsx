import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { AppButton } from "../../components/AppButton";
import { ScreenContainer } from "../../components/ScreenContainer";
import { getVendorDashboardApi, normalizeSubscriptionStatus, type ApiVendorDashboard } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { colors, radii, spacing } from "../../theme/tokens";

const statusColor: Record<string, string> = {
  active: "#16A34A",
  inactive: "#DC2626",
  past_due: "#EA580C",
  cancelled: "#DC2626",
  expired: "#DC2626"
};

export const VendorDashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { role, token } = useAuthStore((state) => ({
    role: state.role,
    token: state.token
  }));
  const [dashboard, setDashboard] = useState<ApiVendorDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token || role !== "vendor") {
      return;
    }

    setError(null);
    try {
      const response = await getVendorDashboardApi(token);
      setDashboard(response);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard");
    }
  }, [role, token]);

  useEffect(() => {
    void load();
  }, [load]);

  if (role !== "vendor") {
    return (
      <ScreenContainer>
        <View style={styles.card}>
          <Text style={styles.title}>{t("dashboardTitle")}</Text>
          <Text style={styles.note}>{t("vendorAccessRequired")}</Text>
        </View>
      </ScreenContainer>
    );
  }

  const subscriptionStatus = normalizeSubscriptionStatus(dashboard?.subscription?.status);
  const isSubscriptionActive = subscriptionStatus === "active";
  const profileComplete = dashboard?.vendor.profileCompleted ?? false;

  return (
    <ScreenContainer style={styles.container}>
      <Text style={styles.title}>{t("dashboardTitle")}</Text>
      <Text style={styles.subtitle}>{dashboard?.vendor.businessName ?? "Vendor workspace"}</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Profile completion</Text>
        <Text style={[styles.status, { color: profileComplete ? "#16A34A" : "#EA580C" }]}>
          {profileComplete ? "Completed" : "Incomplete"}
        </Text>
        <AppButton label={t("manageBusiness")} variant="secondary" onPress={() => navigation.navigate("VendorOnboarding")} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <Text style={[styles.status, { color: statusColor[subscriptionStatus] ?? colors.text }]}>
          {subscriptionStatus.toUpperCase()}
        </Text>
        <Text style={styles.note}>{isSubscriptionActive ? t("subscriptionActive") : t("subscriptionInactive")}</Text>
        {!isSubscriptionActive ? (
          <AppButton label={t("activateSubscription")} onPress={() => navigation.navigate("Subscription")} />
        ) : (
          <AppButton label={t("subscriptionTitle")} variant="secondary" onPress={() => navigation.navigate("Subscription")} />
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Analytics</Text>
        <Text style={styles.metric}>{t("statsViews")}: {dashboard?.stats.views ?? 0}</Text>
        <Text style={styles.metric}>{t("statsDownloads")}: {dashboard?.stats.downloads ?? 0}</Text>
        <Text style={styles.metric}>Coupon downloads: {dashboard?.stats.couponDownloads ?? 0}</Text>
      </View>

      <View style={styles.card}>
        <AppButton label={t("createOffer")} onPress={() => navigation.navigate("CreateOffer")} />
        <AppButton label={t("subscriptionTitle")} variant="secondary" onPress={() => navigation.navigate("Subscription")} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm
  },
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
    padding: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800"
  },
  status: {
    fontWeight: "900",
    fontSize: 16
  },
  note: {
    color: colors.textSecondary
  },
  metric: {
    color: colors.text,
    fontWeight: "700"
  },
  error: {
    color: colors.danger
  }
});
