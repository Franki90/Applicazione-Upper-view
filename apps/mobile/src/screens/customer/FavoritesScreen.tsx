import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { AppButton } from "../../components/AppButton";
import { OfferCard } from "../../components/OfferCard";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useAuthStore } from "../../store/authStore";
import { useOffersStore } from "../../store/offersStore";
import { colors, radii, spacing } from "../../theme/tokens";

export const FavoritesScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { role, user } = useAuthStore((state) => ({ role: state.role, user: state.user }));
  const offers = useOffersStore((state) => state.offers);

  if (role === "guest") {
    return (
      <ScreenContainer>
        <View style={styles.emptyCard}>
          <Text style={styles.title}>{t("guestLimited")}</Text>
          <Text style={styles.text}>{t("unlockMessage")}</Text>
          <AppButton label={t("login")} onPress={() => navigation.navigate("Login")} />
        </View>
      </ScreenContainer>
    );
  }

  const favoriteOffers = offers.filter((offer) => user?.favoriteOfferIds.includes(offer.id));

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t("favorites")}</Text>
      {favoriteOffers.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.text}>{t("noFavorites")}</Text>
          <Text style={styles.text}>{t("addFavoritesHint")}</Text>
        </View>
      ) : (
        favoriteOffers.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            onPress={() => navigation.navigate("OfferDetails", { offerId: offer.id })}
          />
        ))
      )}
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
  text: {
    color: colors.textSecondary,
    lineHeight: 22
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm
  }
});
