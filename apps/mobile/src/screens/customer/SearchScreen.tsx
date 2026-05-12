import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { AppButton } from "../../components/AppButton";
import { CategoryChips } from "../../components/CategoryChips";
import { OfferCard } from "../../components/OfferCard";
import { ScreenContainer } from "../../components/ScreenContainer";
import { distanceKm, requestCurrentLocation } from "../../services/location";
import { useOffersStore } from "../../store/offersStore";
import { CategoryId } from "../../types";
import { colors, radii, spacing } from "../../theme/tokens";

export const SearchScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const offers = useOffersStore((state) => state.offers);
  const setFilters = useOffersStore((state) => state.setFilters);
  const clearFilters = useOffersStore((state) => state.clearFilters);

  const [selectedCategories, setSelectedCategories] = useState<CategoryId[]>([]);
  const [city, setCity] = useState("");
  const [maxDistance, setMaxDistance] = useState("25");
  const [current, setCurrent] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    void requestCurrentLocation().then(setCurrent).catch(() => setCurrent(null));
  }, []);

  const toggleCategory = (id: CategoryId) => {
    setSelectedCategories((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const results = useMemo(() => {
    return offers.filter((offer) => {
      const categoryOk =
        selectedCategories.length === 0 || offer.categoryIds.some((categoryId) => selectedCategories.includes(categoryId));
      const cityOk = !city || offer.city.toLowerCase().includes(city.toLowerCase());

      if (!current || !maxDistance) {
        return categoryOk && cityOk;
      }

      const distance = distanceKm(current.latitude, current.longitude, offer.latitude, offer.longitude);
      const distanceOk = distance <= Number(maxDistance);
      return categoryOk && cityOk && distanceOk;
    });
  }, [offers, selectedCategories, city, current, maxDistance]);

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t("search")}</Text>
      <View style={styles.filterCard}>
        <Text style={styles.label}>{t("city")}</Text>
        <TextInput value={city} onChangeText={setCity} style={styles.input} placeholder={t("defaultCityPlaceholder")} />

        <Text style={styles.label}>{`${t("distance")} (km)`}</Text>
        <TextInput value={maxDistance} onChangeText={setMaxDistance} style={styles.input} keyboardType="numeric" />

        <Text style={styles.label}>Quick categories</Text>
        <CategoryChips selectedIds={selectedCategories} onToggle={toggleCategory} />

        <View style={styles.actions}>
          <AppButton
            label={t("applyFilters")}
            onPress={() =>
              setFilters({
                categories: selectedCategories,
                city,
                maxDistanceKm: Number(maxDistance) || undefined,
                sort: "distance"
              })
            }
          />
          <AppButton
            label={t("clearFilters")}
            variant="secondary"
            onPress={() => {
              setSelectedCategories([]);
              setCity("");
              setMaxDistance("25");
              clearFilters();
            }}
          />
        </View>
      </View>

      <Text style={styles.results}>{`${t("results")}: ${results.length}`}</Text>
      {results.map((offer) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          onPress={() => navigation.navigate("OfferDetails", { offerId: offer.id })}
        />
      ))}
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
  filterCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm
  },
  label: {
    color: colors.text,
    fontWeight: "700"
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 10
  },
  actions: {
    marginTop: spacing.xs,
    gap: spacing.sm
  },
  results: {
    color: colors.textSecondary,
    marginBottom: spacing.sm
  }
});
