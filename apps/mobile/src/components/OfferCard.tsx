import React, { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useCategories } from "../hooks/useCategories";
import { Offer } from "../types";
import { colors, radii, spacing } from "../theme/tokens";

type OfferCardProps = {
  offer: Offer;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
};

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  onPress,
  isFavorite = false,
  onToggleFavorite
}) => {
  const { t, i18n } = useTranslation();
  const categories = useCategories();
  const lang = (i18n.language?.slice(0, 2) ?? "it") as "it" | "en" | "de" | "fr" | "es";
  const categoryLabel = useMemo(() => {
    const primaryCategory = categories.find((item) => item.id === offer.category);
    const fallbackCategory = offer.categoryIds
      .map((id) => categories.find((item) => item.id === id))
      .find(Boolean);
    return primaryCategory?.name[lang] ?? fallbackCategory?.name[lang] ?? offer.category;
  }, [categories, lang, offer.category, offer.categoryIds]);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: offer.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.rowTop}>
          <Text style={styles.title}>{offer.title}</Text>
          {onToggleFavorite ? (
            <Pressable onPress={onToggleFavorite}>
              <Text style={styles.favorite}>{isFavorite ? t("saved") : t("addFavorite")}</Text>
            </Pressable>
          ) : null}
        </View>
        <Text style={styles.vendor}>{`${t("fromVendor")} ${offer.vendorName}`}</Text>
        <Text style={styles.meta}>{`${offer.city} - ${t("validity")}: ${offer.validUntil}`}</Text>
        <View style={styles.bottomRow}>
          <Text style={styles.category}>{categoryLabel}</Text>
          <Text style={styles.popularity}>{`# ${offer.popularity}`}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    overflow: "hidden",
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#0A1A2A",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 14,
    elevation: 4
  },
  image: {
    width: "100%",
    height: 160
  },
  content: {
    padding: spacing.md,
    gap: spacing.xs
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: "800"
  },
  favorite: {
    color: colors.primaryDark,
    fontWeight: "700"
  },
  vendor: {
    color: colors.textSecondary,
    fontSize: 13
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 12
  },
  bottomRow: {
    marginTop: spacing.xs,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  category: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primaryDark,
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.sm
  },
  popularity: {
    color: colors.accent,
    fontWeight: "700"
  }
});
