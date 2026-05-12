import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { AppButton } from "../../components/AppButton";
import { ScreenContainer } from "../../components/ScreenContainer";
import { RootStackParamList } from "../../navigation/types";
import { colors, radii, spacing } from "../../theme/tokens";

type CouponRoute = RouteProp<RootStackParamList, "Coupon">;

export const CouponScreen: React.FC = () => {
  const route = useRoute<CouponRoute>();
  const { t } = useTranslation();

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t("couponTitle")}</Text>
      <View style={styles.card}>
        <View style={styles.fakeQr}>
          <Text style={styles.qrText}>QR</Text>
        </View>

        <Text style={styles.codeLabel}>{t("codeLabel")}</Text>
        <Text style={styles.code}>{route.params.couponCode}</Text>
        <Text style={styles.offer}>{`Offer ID: ${route.params.offerId}`}</Text>

        <AppButton label={t("markUsed")} onPress={() => {}} />
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
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm
  },
  fakeQr: {
    width: 180,
    height: 180,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.primary,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
    backgroundColor: colors.backgroundAlt
  },
  qrText: {
    color: colors.primaryDark,
    fontWeight: "800",
    fontSize: 26
  },
  codeLabel: {
    color: colors.textSecondary,
    fontSize: 13
  },
  code: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 22,
    letterSpacing: 1
  },
  offer: {
    color: colors.textSecondary,
    marginBottom: spacing.md
  }
});
