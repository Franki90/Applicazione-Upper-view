import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { AppButton } from "../../components/AppButton";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useAuthStore } from "../../store/authStore";
import { useOffersStore } from "../../store/offersStore";
import { colors, radii, spacing } from "../../theme/tokens";
import { RootStackParamList } from "../../navigation/types";

type OfferDetailsRoute = RouteProp<RootStackParamList, "OfferDetails">;

export const OfferDetailsScreen: React.FC = () => {
  const { t } = useTranslation();
  const route = useRoute<OfferDetailsRoute>();
  const navigation = useNavigation<any>();
  const role = useAuthStore((state) => state.role);
  const offer = useOffersStore((state) => state.offers.find((item) => item.id === route.params.offerId));

  if (!offer) {
    return (
      <ScreenContainer>
        <Text>{t("offerNotFound")}</Text>
      </ScreenContainer>
    );
  }

  const onDownload = () => {
    const code = `TIC-${offer.id.toUpperCase()}-${Date.now().toString().slice(-4)}`;
    navigation.navigate("Coupon", { offerId: offer.id, couponCode: code });
  };

  return (
    <ScreenContainer>
      <Image source={{ uri: offer.imageUrl }} style={styles.image} />
      <View style={styles.card}>
        <Text style={styles.title}>{offer.title}</Text>
        <Text style={styles.meta}>{`${t("offerLocation")}: ${offer.city}`}</Text>
        <Text style={styles.meta}>{`${t("validity")}: ${offer.validUntil}`}</Text>

        <Text style={styles.label}>{t("offerDescription")}</Text>
        <Text style={styles.description}>{offer.description}</Text>

        {role === "customer" ? (
          <AppButton label={t("downloadCoupon")} onPress={onDownload} />
        ) : (
          <AppButton label={t("registerToDownload")} onPress={() => navigation.navigate("Login")} />
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 220,
    borderRadius: radii.lg,
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
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900"
  },
  meta: {
    color: colors.textSecondary
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    marginTop: spacing.sm
  },
  description: {
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md
  }
});
