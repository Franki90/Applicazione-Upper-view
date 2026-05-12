import React from "react";
import { ScrollView, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { CategoryIcon } from "./CategoryIcon";
import { useCategories } from "../hooks/useCategories";
import { CategoryId } from "../types";
import { colors, radii, spacing } from "../theme/tokens";

type CategoryChipsProps = {
  selectedIds: CategoryId[];
  onToggle: (categoryId: CategoryId) => void;
};

export const CategoryChips: React.FC<CategoryChipsProps> = ({ selectedIds, onToggle }) => {
  const { i18n } = useTranslation();
  const categories = useCategories();
  const lang = (i18n.language?.slice(0, 2) ?? "it") as "it" | "en" | "de" | "fr" | "es";

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {categories.map((category) => {
        const selected = selectedIds.includes(category.id);
        return (
          <Pressable
            key={category.id}
            onPress={() => onToggle(category.id)}
            style={[styles.chip, selected ? styles.chipSelected : null]}
          >
            <View style={styles.iconWrap}>
              <CategoryIcon icon={category.icon} size={13} color={selected ? colors.primaryDark : colors.text} />
            </View>
            <Text style={[styles.text, selected ? styles.textSelected : null]}>{category.name[lang]}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingVertical: spacing.xs
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: spacing.sm,
    paddingVertical: 8
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: "#EEF2FF"
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center"
  },
  text: {
    color: colors.textSecondary,
    fontWeight: "700",
    fontSize: 12
  },
  textSelected: {
    color: colors.primaryDark
  }
});
