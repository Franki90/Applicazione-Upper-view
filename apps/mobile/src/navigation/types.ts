export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: { accountType?: "customer" | "vendor" } | undefined;
  MainTabs: undefined;
  OfferDetails: { offerId: string };
  Coupon: { offerId: string; couponCode: string };
  CreateOffer: undefined;
  Subscription: undefined;
  VendorOnboarding: undefined;
  CustomerOnboarding: { fromRegistration?: boolean } | undefined;
};

