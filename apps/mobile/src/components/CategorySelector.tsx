import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { CategoryIcon } from "./CategoryIcon";
import { useCategories } from "../hooks/useCategories";
import { CategoryId } from "../types";
import { colors, radii, spacing } from "../theme/tokens";

type CategorySelectorProps = {
  selectedIds: CategoryId[];
  onChange: (ids: CategoryId[]) => void;
  maxSelection?: number;
  searchable?: boolean;
};

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedIds,
  onChange,
  maxSelection,
  searchable = true
}) => {
  const { i18n } = useTranslation();
  const [search, setSearch] = useState("");
  const categories = useCategories();
  const lang = (i18n.language?.slice(0, 2) ?? "it") as "it" | "en" | "de" | "fr" | "es";
  const selectionLimitReached = Boolean(maxSelection && selectedIds.length >= maxSelection);

  const items = useMemo(() => {
    if (!search.trim()) return categories;
    const query = search.toLowerCase();
    return categories.filter(
      (category) =>
        category.name[lang].toLowerCase().includes(query) ||
        category.description[lang].toLowerCase().includes(query)
    );
  }, [categories, lang, search]);

  const toggle = (id: CategoryId) => {
    const exists = selectedIds.includes(id);
    if (exists) {
      onChange(selectedIds.filter((value) => value !== id));
      return;
    }
    if (maxSelection && selectedIds.length >= maxSelection) {
      return;
    }
    onChange([...selectedIds, id]);
  };

  return (
    <View style={styles.wrapper}>
      {searchable ? (
        <TextInput
          placeholder="Search categories..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
          autoCapitalize="none"
        />
      ) : null}
      {maxSelection ? (
        <Text style={styles.helper}>{`${selectedIds.length}/${maxSelection} selected`}</Text>
      ) : null}

      <View style={styles.grid}>
        {items.map((category) => {
          const selected = selectedIds.includes(category.id);
          const disabled = selectionLimitReached && !selected;
          return (
            <Pressable
              key={category.id}
              onPress={() => toggle(category.id)}
              style={[styles.card, selected ? styles.cardSelected : null, disabled ? styles.cardDisabled : null]}
              disabled={disabled}
            >
              <CategoryIcon icon={category.icon} size={20} color={selected ? colors.primaryDark : colors.text} />
              <Text style={[styles.name, selected ? styles.nameSelected : null]} numberOfLines={2}>
                {category.name[lang]}
              </Text>
              <Text style={styles.description} numberOfLines={2}>
                {category.description[lang]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm
  },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: spacing.md,
    paddingVertical: 11
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  helper: {
    color: colors.textSecondary,
    fontSize: 12
  },
  card: {
    width: "48%",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.sm,
    gap: spacing.xs
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: "#EEF2FF"
  },
  cardDisabled: {
    opacity: 0.45
  },
  name: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 12
  },
  nameSelected: {
    color: colors.primaryDark
  },
  description: {
    color: colors.textSecondary,
    fontSize: 10
  }
});
