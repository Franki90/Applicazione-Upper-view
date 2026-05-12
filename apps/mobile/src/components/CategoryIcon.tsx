import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type CategoryIconProps = {
  icon: string;
  size?: number;
  color?: string;
};

const iconMap: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  utensils: "silverware-fork-knife",
  bag: "shopping-outline",
  sparkles: "auto-fix",
  dumbbell: "dumbbell",
  briefcase: "briefcase-outline",
  home: "home-outline",
  car: "car-outline",
  "book-open": "book-open-page-variant-outline",
  baby: "baby-face-outline",
  ticket: "ticket-confirmation-outline",
  plane: "airplane",
  leaf: "leaf",
  "briefcase-business": "briefcase-account-outline",
  handshake: "handshake-outline"
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ icon, size = 20, color = "#1F2937" }) => {
  return <MaterialCommunityIcons name={iconMap[icon] ?? "shape-outline"} size={size} color={color} />;
};
