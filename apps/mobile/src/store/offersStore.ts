import { create } from "zustand";
import { CategoryId, Offer } from "../types";

export type OfferFilters = {
  categories?: CategoryId[];
  city?: string;
  maxDistanceKm?: number;
  expiringSoon?: boolean;
  sort?: "popularity" | "distance" | "expiring";
};

type OffersState = {
  offers: Offer[];
  selectedOfferId: string | null;
  filters: OfferFilters;
  setSelectedOffer: (id: string | null) => void;
  setFilters: (filters: OfferFilters) => void;
  clearFilters: () => void;
};

const demoOffers: Offer[] = [
  {
    id: "offer-1",
    title: "Aperitivo sul lago 2x1",
    description: "Cocktail + stuzzichini con vista Lugano. Valido dal lunedi al giovedi.",
    category: "food_restaurants",
    categoryIds: ["food_restaurants", "events_leisure"],
    city: "Lugano",
    latitude: 46.0037,
    longitude: 8.9511,
    imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80",
    validUntil: "2026-06-15",
    popularity: 138,
    vendorName: "Bistro Lago"
  },
  {
    id: "offer-2",
    title: "Taglio capelli studenti -30%",
    description: "Promo dedicata a studenti in tutto il mese.",
    category: "beauty_personal_care",
    categoryIds: ["beauty_personal_care"],
    city: "Bellinzona",
    latitude: 46.1954,
    longitude: 9.0297,
    imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
    validUntil: "2026-05-30",
    popularity: 89,
    vendorName: "Style Ticino"
  },
  {
    id: "offer-3",
    title: "Pass palestra weekend",
    description: "Ingresso weekend e consulenza gratuita.",
    category: "fitness_sports",
    categoryIds: ["fitness_sports"],
    city: "Locarno",
    latitude: 46.1702,
    longitude: 8.7995,
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
    validUntil: "2026-05-07",
    popularity: 210,
    vendorName: "Pulse Gym"
  },
  {
    id: "offer-4",
    title: "Sconto brunch domenica",
    description: "Brunch locale con prodotti ticinesi.",
    category: "food_restaurants",
    categoryIds: ["food_restaurants", "sustainability_local"],
    city: "Mendrisio",
    latitude: 45.8712,
    longitude: 8.9842,
    imageUrl: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=800&q=80",
    validUntil: "2026-05-03",
    popularity: 67,
    vendorName: "Pane e Sole"
  }
];

export const useOffersStore = create<OffersState>((set) => ({
  offers: demoOffers,
  selectedOfferId: null,
  filters: {},
  setSelectedOffer: (id) => set({ selectedOfferId: id }),
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} })
}));
