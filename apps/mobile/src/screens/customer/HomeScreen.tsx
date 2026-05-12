import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { AppButton } from "../../components/AppButton";
import { PersonalizedFeed } from "../../components/PersonalizedFeed";
import { ScreenContainer } from "../../components/ScreenContainer";
import { requestCurrentLocation } from "../../services/location";
import { useAuthStore } from "../../store/authStore";
import { useOffersStore } from "../../store/offersStore";
import { colors, radii, spacing } from "../../theme/tokens";

export const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { role, user, toggleFavorite } = useAuthStore((state) => ({
    role: state.role,
    user: state.user,
    toggleFavorite: state.toggleFavorite
  }));
  const offers = useOffersStore((state) => state.offers);
  const [current, setCurrent] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    void requestCurrentLocation().then(setCurrent).catch(() => setCurrent(null));
  }, []);

  const subtitle = useMemo(() => {
    if (role === "customer" && (user?.selectedCategoryIds.length ?? 0) > 0) {
      return "Personalized for your interests";
    }
    return t("popularOffers");
  }, [role, t, user?.selectedCategoryIds.length]);

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t("nearYou")}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <PersonalizedFeed
        offers={offers}
        role={role}
        selectedCategoryIds={user?.selectedCategoryIds ?? []}
        currentLocation={current}
        onOfferPress={(offerId) => navigation.navigate("OfferDetails", { offerId })}
        isFavorite={(offerId) => user?.favoriteOfferIds.includes(offerId) ?? false}
        onToggleFavorite={role === "customer" ? toggleFavorite : undefined}
      />

      {role === "guest" ? (
        <View style={styles.guestBox}>
          <Text style={styles.guestTitle}>{t("guestLimited")}</Text>
          <Text style={styles.guestMessage}>{t("unlockMessage")}</Text>
          <AppButton label={t("register")} onPress={() => navigation.navigate("Register")} />
        </View>
      ) : null}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    marginTop: spacing.sm
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.md
  },
  guestBox: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm
  },
  guestTitle: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 18
  },
  guestMessage: {
    color: colors.textSecondary,
    lineHeight: 20
  }
});
