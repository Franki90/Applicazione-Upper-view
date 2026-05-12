import {
  CategoryId,
  CouponBuilderInput,
  OfferDraft,
  VendorBranding,
  VendorSubscriptionStatus
} from "../types";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  token?: string | null;
  body?: unknown;
};

export type ApiRole = "CUSTOMER" | "VENDOR" | "ADMIN";

export type ApiAuthResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: ApiRole;
    selectedCategoryIds?: CategoryId[];
  };
};

export type SocialProvider = "google" | "apple";

export type ApiVendorProfile = {
  id: string;
  businessName: string;
  description?: string | null;
  category?: string | null;
  categoryIds: CategoryId[];
  address?: string | null;
  city: string;
  area?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  socialLinks?: Record<string, string> | null;
  openingHours?: Record<string, string> | null;
  logoUrl?: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  isProfileCompleted: boolean;
};

export type ApiVendorDashboard = {
  vendor: {
    id: string;
    businessName: string;
    city: string;
    logoUrl?: string | null;
    categoryIds: CategoryId[];
    branding: VendorBranding;
    profileCompleted: boolean;
  };
  subscription: {
    status: "INACTIVE" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED";
    currentPeriodEnd?: string | null;
    monthlyPriceCents?: number;
  } | null;
  activeSubscription: boolean;
  stats: {
    offers: number;
    activeOffers: number;
    views: number;
    downloads: number;
    couponDownloads: number;
  };
};

export type ApiSubscriptionCheckout = {
  checkoutUrl: string;
  priceCents: number;
  currency: string;
  plan: string;
};

export type ApiSubscriptionStatus = {
  active: boolean;
  status: "INACTIVE" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED";
  canPublishOffers: boolean;
  subscription?: {
    currentPeriodEnd?: string | null;
  } | null;
};

export type ApiCategory = {
  id: CategoryId;
  nameIt: string;
  nameEn: string;
  nameDe: string;
  nameFr: string;
  nameEs: string;
  icon: string;
  descriptionIt: string;
  descriptionEn: string;
  descriptionDe: string;
  descriptionFr: string;
  descriptionEs: string;
};

type ApiOfferCreatePayload = {
  title: string;
  category: string;
  categoryIds: CategoryId[];
  description: string;
  includedItems: string[];
  terms: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage?: number;
  startDate: string;
  endDate: string;
  location: string;
  city: string;
  imageUrls: string[];
  maxCouponDownloads: number;
  usageLimitPerCustomer: number;
};

const assertApiUrl = (): string => {
  if (!API_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }
  return API_URL;
};

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const apiUrl = assertApiUrl();

  const response = await fetch(`${apiUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = payload?.message ?? "API request failed";
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const loginWithEmailApi = (email: string, password: string) =>
  apiRequest<ApiAuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password }
  });

export const loginWithSocialApi = (provider: SocialProvider, idToken: string) =>
  apiRequest<ApiAuthResponse>("/auth/social", {
    method: "POST",
    body: { provider, idToken }
  });

export const registerCustomerApi = (payload: {
  name: string;
  email: string;
  password: string;
  selectedCategoryIds?: CategoryId[];
}) =>
  apiRequest<ApiAuthResponse>("/auth/register/customer", {
    method: "POST",
    body: payload
  });

export const registerVendorApi = (payload: {
  name: string;
  email: string;
  password: string;
  businessName: string;
  city: string;
  latitude: number;
  longitude: number;
  categoryIds: CategoryId[];
}) =>
  apiRequest<ApiAuthResponse>("/auth/register/vendor", {
    method: "POST",
    body: payload
  });

export const registerPushDeviceApi = (
  token: string,
  pushToken: string,
  payload?: {
    platform?: "ios" | "android" | "web" | "unknown";
    locale?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  }
) =>
  apiRequest("/notifications/devices", {
    method: "POST",
    token,
    body: {
      expoPushToken: pushToken,
      ...payload
    }
  });

const toSocialLinks = (raw: string): Record<string, string> => {
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, item, index) => {
      const separator = item.indexOf(":");
      const key = separator > -1 ? item.slice(0, separator).trim() : `link${index + 1}`;
      const value = separator > -1 ? item.slice(separator + 1).trim() : item.trim();
      if (!value) return acc;
      acc[key] = value;
      return acc;
    }, {});
};

const toOpeningHours = (raw: string): Record<string, string> => {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, item, index) => {
      const separator = item.indexOf(":");
      const day = separator > -1 ? item.slice(0, separator).trim() : `day${index + 1}`;
      const hours = separator > -1 ? item.slice(separator + 1).trim() : item.trim();
      if (!hours) return acc;
      acc[day] = hours;
      return acc;
    }, {});
};

export const createVendorProfileApi = (
  token: string,
  payload: {
    businessName: string;
    description: string;
    category: string;
    categoryIds: CategoryId[];
    address: string;
    city: string;
    area: string;
    phone: string;
    email: string;
    website: string;
    socialLinks: string;
    openingHours: string;
    logoUrl: string;
    branding: VendorBranding;
  }
) =>
  apiRequest<ApiVendorProfile>("/vendors/profile", {
    method: "POST",
    token,
    body: {
      businessName: payload.businessName,
      description: payload.description,
      category: payload.category,
      categoryIds: payload.categoryIds,
      address: payload.address,
      city: payload.city,
      area: payload.area,
      phone: payload.phone,
      email: payload.email,
      website: payload.website || undefined,
      socialLinks: toSocialLinks(payload.socialLinks),
      openingHours: toOpeningHours(payload.openingHours),
      logoUrl: payload.logoUrl || undefined,
      primaryColor: payload.branding.primaryColor,
      secondaryColor: payload.branding.secondaryColor,
      accentColor: payload.branding.accentColor,
      backgroundColor: payload.branding.backgroundColor
    }
  });

export const updateVendorProfileApi = (
  token: string,
  vendorId: string,
  payload: {
    businessName?: string;
    description?: string;
    category?: string;
    categoryIds?: CategoryId[];
    address?: string;
    city?: string;
    area?: string;
    phone?: string;
    email?: string;
    website?: string;
    socialLinks?: string;
    openingHours?: string;
    logoUrl?: string;
    branding?: VendorBranding;
  }
) =>
  apiRequest<ApiVendorProfile>(`/vendors/profile/${vendorId}`, {
    method: "PUT",
    token,
    body: {
      ...payload,
      ...(payload.website === "" ? { website: undefined } : {}),
      ...(payload.logoUrl === "" ? { logoUrl: undefined } : {}),
      ...(payload.socialLinks ? { socialLinks: toSocialLinks(payload.socialLinks) } : {}),
      ...(payload.openingHours ? { openingHours: toOpeningHours(payload.openingHours) } : {}),
      ...(payload.branding
        ? {
            primaryColor: payload.branding.primaryColor,
            secondaryColor: payload.branding.secondaryColor,
            accentColor: payload.branding.accentColor,
            backgroundColor: payload.branding.backgroundColor
          }
        : {})
    }
  });

export const uploadVendorLogoApi = (token: string, logoUrl: string) =>
  apiRequest<{ logoUrl: string }>("/vendors/logo-upload", {
    method: "POST",
    token,
    body: { logoUrl }
  });

export const getVendorDashboardApi = (token: string) =>
  apiRequest<ApiVendorDashboard>("/vendors/dashboard", {
    token
  });

export const saveVendorCategoriesApi = (token: string, categoryIds: CategoryId[]) =>
  apiRequest<{ vendorId: string; categoryIds: CategoryId[] }>("/vendors/categories", {
    method: "POST",
    token,
    body: { categoryIds }
  });

export const updateVendorCategoriesApi = (token: string, categoryIds: CategoryId[]) =>
  apiRequest<{ vendorId: string; categoryIds: CategoryId[] }>("/vendors/categories", {
    method: "PUT",
    token,
    body: { categoryIds }
  });

export const getCategoriesApi = () => apiRequest<ApiCategory[]>("/categories");

export const saveUserPreferencesApi = (token: string, selectedCategoryIds: CategoryId[]) =>
  apiRequest<{ id: string; selectedCategoryIds: CategoryId[] }>("/users/preferences", {
    method: "POST",
    token,
    body: { selectedCategoryIds }
  });

export const getUserPreferencesApi = (token: string) =>
  apiRequest<{ id: string; selectedCategoryIds: CategoryId[] }>("/users/preferences", {
    token
  });

export const getVendorProfileApi = (token: string, vendorId: string) =>
  apiRequest<ApiVendorProfile>(`/vendors/profile/${vendorId}`, {
    token
  });

export const createSubscriptionCheckoutSessionApi = (token: string) =>
  apiRequest<ApiSubscriptionCheckout>("/subscriptions/create-checkout-session", {
    method: "POST",
    token
  });

export const getSubscriptionStatusApi = (token: string, vendorId: string) =>
  apiRequest<ApiSubscriptionStatus>(`/subscriptions/status/${vendorId}`, {
    token
  });

const toOfferCreatePayload = (draft: OfferDraft): ApiOfferCreatePayload => {
  const originalPrice = Number(draft.originalPrice);
  const discountedPrice = Number(draft.discountedPrice);
  const discountFromPrices =
    originalPrice > 0 ? Number((((originalPrice - discountedPrice) / originalPrice) * 100).toFixed(2)) : 0;
  const typedDiscount = Number(draft.discountPercentage);

  return {
    title: draft.title.trim(),
    category: (draft.categoryIds[0] ?? draft.category).trim(),
    categoryIds: draft.categoryIds,
    description: draft.description.trim(),
    includedItems: draft.includedItems.map((item) => item.trim()).filter(Boolean),
    terms: draft.terms.trim(),
    originalPrice,
    discountedPrice,
    discountPercentage: Number.isFinite(typedDiscount) && typedDiscount > 0 ? typedDiscount : discountFromPrices,
    startDate: new Date(draft.startDate).toISOString(),
    endDate: new Date(draft.endDate).toISOString(),
    location: draft.location.trim(),
    city: draft.city.trim(),
    imageUrls: draft.imageUrls.filter(Boolean),
    maxCouponDownloads: Number(draft.maxCouponDownloads),
    usageLimitPerCustomer: Number(draft.usageLimitPerCustomer)
  };
};

export const createOfferApi = (token: string, draft: OfferDraft) =>
  apiRequest<{ offer: { id: string } }>("/offers", {
    method: "POST",
    token,
    body: toOfferCreatePayload(draft)
  });

export const updateOfferApi = (token: string, offerId: string, draft: OfferDraft) =>
  apiRequest<{ offer: { id: string } }>(`/offers/${offerId}`, {
    method: "PUT",
    token,
    body: toOfferCreatePayload(draft)
  });

const toCouponApiPayload = (offerId: string, input: CouponBuilderInput) => ({
  offerId,
  title: input.title,
  subtitle: input.subtitle,
  couponCode: input.couponCode,
  terms: input.terms,
  validityStart: input.validityStart ? new Date(input.validityStart).toISOString() : undefined,
  validityEnd: input.validityEnd ? new Date(input.validityEnd).toISOString() : undefined,
  layout: input.layout.toUpperCase(),
  pattern: input.pattern.toUpperCase(),
  primaryColor: input.primaryColor,
  secondaryColor: input.secondaryColor,
  textColor: input.textColor,
  backgroundColor: input.backgroundColor,
  borderStyle: input.borderStyle.toUpperCase(),
  couponImageUrl: input.uploadedFileUrl,
  uploadedFileUrl: input.uploadedFileUrl
});

export const generateCouponApi = (token: string, offerId: string, input: CouponBuilderInput) =>
  apiRequest<{ coupon: { id: string } }>("/coupons/generate", {
    method: "POST",
    token,
    body: toCouponApiPayload(offerId, input)
  });

export const uploadCouponApi = (token: string, offerId: string, input: CouponBuilderInput) =>
  apiRequest<{ coupon: { id: string } }>("/coupons/upload", {
    method: "POST",
    token,
    body: toCouponApiPayload(offerId, input)
  });

export const publishOfferApi = (token: string, offerId: string) =>
  apiRequest<{ message: string }>(`/offers/${offerId}/publish`, {
    method: "POST",
    token
  });

export const getCouponApi = (token: string, couponId: string) =>
  apiRequest(`/coupons/${couponId}`, {
    token
  });

export const downloadCouponApi = (token: string, couponId: string) =>
  apiRequest(`/coupons/${couponId}/download`, {
    method: "POST",
    token
  });

export const markCouponUsedApi = (token: string, couponId: string) =>
  apiRequest(`/coupons/${couponId}/mark-used`, {
    method: "POST",
    token
  });

export const normalizeSubscriptionStatus = (
  status:
    | ApiSubscriptionStatus["status"]
    | NonNullable<ApiVendorDashboard["subscription"]>["status"]
    | undefined
): VendorSubscriptionStatus => {
  if (status === "ACTIVE") return "active";
  if (status === "PAST_DUE") return "past_due";
  if (status === "CANCELED") return "cancelled";
  if (status === "EXPIRED") return "expired";
  return "inactive";
};
