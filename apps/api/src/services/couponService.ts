export const randomSuffix = (size = 6): string => {
  return Math.random().toString(36).slice(2, 2 + size).toUpperCase();
};

export const generateCouponCode = (businessName: string, offerTitle: string): string => {
  const chunk = (value: string) => value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase();
  const business = chunk(businessName) || "TIC";
  const offer = chunk(offerTitle) || "OFF";
  return `TD-${business}-${offer}-${randomSuffix(5)}`;
};

export const buildCouponQrValue = (couponCode: string): string => {
  return `ticino-deals://coupon/${couponCode}`;
};
