import React, { useEffect, useState } from "react";
import { Alert, Linking, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { AppButton } from "../../components/AppButton";
import { ScreenContainer } from "../../components/ScreenContainer";
import {
  createSubscriptionCheckoutSessionApi,
  getSubscriptionStatusApi,
  getVendorDashboardApi,
  normalizeSubscriptionStatus
} from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { colors, radii, spacing } from "../../theme/tokens";

const statusText: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  past_due: "Past due",
  cancelled: "Cancelled",
  expired: "Expired"
};

export const SubscriptionScreen: React.FC = () => {
  const { t } = useTranslation();
  const { token, role } = useAuthStore((state) => ({
    token: state.token,
    role: state.role
  }));
  const [status, setStatus] = useState<"active" | "inactive" | "past_due" | "cancelled" | "expired">("inactive");
  const [loading, setLoading] = useState(false);
  const [vendorId, setVendorId] = useState<string | null>(null);

  useEffect(() => {
    if (!token || role !== "vendor") return;

    const load = async () => {
      try {
        const dashboard = await getVendorDashboardApi(token);
        setVendorId(dashboard.vendor.id);
        const subscription = await getSubscriptionStatusApi(token, dashboard.vendor.id);
        setStatus(normalizeSubscriptionStatus(subscription.status));
      } catch (_error) {
        setStatus("inactive");
      }
    };

    void load();
  }, [token, role]);

  const onActivate = async () => {
    if (!token || role !== "vendor") {
      Alert.alert("Vendor only", "This plan is available only for vendor accounts.");
      return;
    }

    setLoading(true);
    try {
      const checkout = await createSubscriptionCheckoutSessionApi(token);
      if (!checkout.checkoutUrl) {
        throw new Error("Checkout URL not available");
      }
      await Linking.openURL(checkout.checkoutUrl);
    } catch (error) {
      Alert.alert("Checkout failed", error instanceof Error ? error.message : "Unable to open Stripe checkout");
    } finally {
      setLoading(false);
    }
  };

  const isActive = status === "active";

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t("subscriptionTitle")}</Text>
      <View style={styles.card}>
        <Text style={styles.price}>CHF 25 / month</Text>
        <Text style={styles.note}>{t("subscriptionNote")}</Text>
        <Text style={[styles.status, { color: isActive ? "#16A34A" : "#DC2626" }]}>
          Status: {statusText[status]}
        </Text>
        {vendorId ? <Text style={styles.vendorRef}>Vendor ID: {vendorId}</Text> : null}
        <View style={styles.features}>
          <Text style={styles.feature}>- {t("subscriptionFeature1")}</Text>
          <Text style={styles.feature}>- {t("subscriptionFeature2")}</Text>
          <Text style={styles.feature}>- {t("subscriptionFeature3")}</Text>
        </View>
        <AppButton
          label={loading ? "Opening checkout..." : t("activateSubscription")}
          onPress={onActivate}
          disabled={loading}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    marginBottom: spacing.md
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm
  },
  price: {
    color: colors.primaryDark,
    fontSize: 28,
    fontWeight: "900"
  },
  note: {
    color: colors.textSecondary,
    marginBottom: spacing.sm
  },
  status: {
    fontWeight: "900",
    marginBottom: spacing.sm
  },
  vendorRef: {
    color: colors.textSecondary,
    fontSize: 11
  },
  features: {
    gap: spacing.xs,
    marginBottom: spacing.md
  },
  feature: {
    color: colors.text
  }
});
