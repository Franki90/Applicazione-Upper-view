export type AdminAuthResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: "CUSTOMER" | "VENDOR" | "ADMIN";
  };
};

export type AdminAnalytics = {
  users: number;
  vendors: number;
  offers: number;
  coupons: number;
  pushDevices: number;
};

export type PendingOffer = {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  validUntil?: string | null;
  endDate?: string | null;
  createdAt: string;
  vendor: {
    businessName: string;
    city: string;
  };
};
