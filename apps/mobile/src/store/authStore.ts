import { create } from "zustand";
import { AuthUser, CategoryId, UserRole } from "../types";
import {
  ApiAuthResponse,
  ApiRole,
  loginWithEmailApi,
  loginWithSocialApi,
  SocialProvider
} from "../services/api";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  role: UserRole;
  loading: boolean;
  error: string | null;
  setGuest: () => void;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  loginWithSocial: (provider: SocialProvider, idToken: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  toggleFavorite: (offerId: string) => void;
  setSelectedCategories: (categoryIds: CategoryId[]) => void;
  setAuthSession: (payload: ApiAuthResponse) => void;
};

const guestUser: AuthUser = {
  id: "guest",
  name: "Guest",
  email: "",
  role: "guest",
  favoriteOfferIds: [],
  selectedCategoryIds: []
};

const mapRole = (role: ApiRole): UserRole => {
  if (role === "VENDOR") return "vendor";
  if (role === "CUSTOMER") return "customer";
  return "customer";
};

const authPayloadToState = (payload: ApiAuthResponse) => {
  const role = mapRole(payload.user.role);
  return {
    token: payload.token,
    role,
    loading: false,
    user: {
      id: payload.user.id,
      name: payload.user.name,
      email: payload.user.email,
      role,
      favoriteOfferIds: [],
      selectedCategoryIds: payload.user.selectedCategoryIds ?? []
    }
  } as const;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: guestUser,
  role: "guest",
  loading: false,
  error: null,
  clearError: () => set({ error: null }),
  setGuest: () => set({ token: null, role: "guest", user: guestUser, error: null }),
  loginWithEmail: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const payload = await loginWithEmailApi(email, password);
      set(authPayloadToState(payload));
      return true;
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Login failed"
      });
      return false;
    }
  },
  loginWithSocial: async (provider, idToken) => {
    set({ loading: true, error: null });
    try {
      const payload = await loginWithSocialApi(provider, idToken);
      set(authPayloadToState(payload));
      return true;
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Social login failed"
      });
      return false;
    }
  },
  logout: () => set({ token: null, role: "guest", user: guestUser, error: null }),
  toggleFavorite: (offerId) => {
    const user = get().user;
    if (!user || user.role === "guest") {
      return;
    }
    const has = user.favoriteOfferIds.includes(offerId);
    const favoriteOfferIds = has
      ? user.favoriteOfferIds.filter((id) => id !== offerId)
      : [...user.favoriteOfferIds, offerId];
    set({
      user: {
        ...user,
        favoriteOfferIds
      }
    });
  },
  setSelectedCategories: (categoryIds) => {
    const user = get().user;
    if (!user || user.role === "guest") return;
    set({
      user: {
        ...user,
        selectedCategoryIds: categoryIds
      }
    });
  },
  setAuthSession: (payload) => set(authPayloadToState(payload))
}));
