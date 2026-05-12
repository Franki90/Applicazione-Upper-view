import { useEffect, useState } from "react";
import { CATEGORY_CATALOG } from "../constants/categories";
import { getCategoriesApi } from "../services/api";
import { CategoryDefinition } from "../types";

const mapApiCategory = (item: {
  id: string;
  icon: string;
  nameIt: string;
  nameEn: string;
  nameDe: string;
  nameFr: string;
  nameEs: string;
  descriptionIt: string;
  descriptionEn: string;
  descriptionDe: string;
  descriptionFr: string;
  descriptionEs: string;
}): CategoryDefinition => ({
  id: item.id,
  icon: item.icon,
  name: {
    it: item.nameIt,
    en: item.nameEn,
    de: item.nameDe,
    fr: item.nameFr,
    es: item.nameEs
  },
  description: {
    it: item.descriptionIt,
    en: item.descriptionEn,
    de: item.descriptionDe,
    fr: item.descriptionFr,
    es: item.descriptionEs
  }
});

export const useCategories = () => {
  const [categories, setCategories] = useState<CategoryDefinition[]>(CATEGORY_CATALOG);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const apiCategories = await getCategoriesApi();
        if (!mounted || apiCategories.length === 0) return;
        setCategories(apiCategories.map(mapApiCategory));
      } catch (_error) {
        // Keep bundled catalog as fallback when API is unavailable.
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  return categories;
};
