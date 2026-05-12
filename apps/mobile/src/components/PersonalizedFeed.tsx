import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Offer, CategoryId, UserRole } from "../types";
import { distanceKm } from "../services/location";
import { OfferCard } from "./OfferCard";
import { colors, spacing } from "../theme/tokens";

type PersonalizedFeedProps = {
  offers: Offer[];
  role: UserRole;
  selectedCategoryIds: CategoryId[];
  currentLocation: { latitude: number; longitude: number } | null;
  onOfferPress: (offerId: string) => void;
  isFavorite: (offerId: string) => boolean;
  onToggleFavorite?: (offerId: string) => void;
};

const daysUntil = (date: string): number => {
  const value = new Date(date).getTime();
  if (Number.isNaN(value)) return Number.POSITIVE_INFINITY;
  return value - Date.now();
};

export const PersonalizedFeed: React.FC<PersonalizedFeedProps> = ({
  offers,
  role,
  selectedCategoryIds,
  currentLocation,
  onOfferPress,
  isFavorite,
  onToggleFavorite
}) => {
  const sorted = useMemo(() => {
    const base = role === "guest" ? offers.slice(0, 2) : offers;

    return base
      .map((offer) => {
        const match =
          selectedCategoryIds.length > 0 &&
          offer.categoryIds.some((categoryId) => selectedCategoryIds.includes(categoryId));
        const distance =
          currentLocation !== null
            ? distanceKm(currentLocation.latitude, currentLocation.longitude, offer.latitude, offer.longitude)
            : Number.POSITIVE_INFINITY;
        const expiringValue = daysUntil(offer.validUntil);

        return {
          offer: {
            ...offer,
            distanceKm: Number.isFinite(distance) ? distance : undefined
          },
          match: match ? 1 : 0,
          distance,
          popularity: offer.popularity,
          expiringValue
        };
      })
      .sort((a, b) => {
        if (role !== "guest" && selectedCategoryIds.length > 0 && a.match !== b.match) {
          return b.match - a.match;
        }
        if (a.distance !== b.distance) return a.distance - b.distance;
        if (a.popularity !== b.popularity) return b.popularity - a.popularity;
        return a.expiringValue - b.expiringValue;
      })
      .map((item) => item.offer);
  }, [offers, role, selectedCategoryIds, currentLocation]);

  if (sorted.length === 0) {
    return <Text style={styles.empty}>No offers found for selected categories.</Text>;
  }

  return (
    <View>
      {sorted.map((offer) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          onPress={() => onOfferPress(offer.id)}
          isFavorite={isFavorite(offer.id)}
          onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(offer.id) : undefined}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  empty: {
    color: colors.textSecondary,
    marginTop: spacing.md
  }
});
