export type UserRole = "guest" | "customer" | "vendor";

export type CategoryId = string;

export type OfferCategory = CategoryId;

export type CategoryDefinition = {
  id: CategoryId;
  icon: string;
  name: {
    it: string;
    en: string;
    de: string;
    fr: string;
    es: string;
  };
  description: {
    it: string;
    en: string;
    de: string;
    fr: string;
    es: string;
  };
};

export type Offer = {
  id: string;
  title: string;
  description: string;
  category: OfferCategory;
  categoryIds: CategoryId[];
  city: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  validUntil: string;
  popularity: number;
  vendorName: string;
  distanceKm?: number;
};

export type Coupon = {
  id: string;
  offerId: string;
  code: string;
  qrValue: string;
  status: "downloaded" | "used";
  downloadedAt: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  favoriteOfferIds: string[];
  selectedCategoryIds: CategoryId[];
};

export type VendorBranding = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
};

export type VendorProfileForm = {
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
};

export type VendorSubscriptionStatus = "inactive" | "active" | "past_due" | "cancelled" | "expired";

export type CouponPattern =
  | "minimal"
  | "dots"
  | "waves"
  | "diagonal_lines"
  | "confetti"
  | "gradient"
  | "geometric";

export type CouponLayout = "classic" | "modern" | "premium" | "youthful" | "minimal";

export type CouponBorderStyle = "none" | "solid" | "dashed" | "double" | "bold";

export type CouponBuilderInput = {
  type: "generated" | "uploaded";
  title: string;
  subtitle: string;
  couponCode: string;
  offerDetails: string;
  terms: string;
  validityStart: string;
  validityEnd: string;
  layout: CouponLayout;
  pattern: CouponPattern;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  backgroundColor: string;
  borderStyle: CouponBorderStyle;
  uploadedFileUrl?: string;
};

export type OfferDraft = {
  title: string;
  category: string;
  categoryIds: CategoryId[];
  description: string;
  includedItems: string[];
  terms: string;
  originalPrice: string;
  discountedPrice: string;
  discountPercentage: string;
  startDate: string;
  endDate: string;
  location: string;
  city: string;
  imageUrls: string[];
  maxCouponDownloads: string;
  usageLimitPerCustomer: string;
};
