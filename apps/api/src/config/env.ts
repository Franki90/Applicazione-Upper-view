import dotenv from "dotenv";

dotenv.config();

const must = (value: string | undefined, key: string): string => {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

const parseCsv = (value: string | undefined): string[] => {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: must(process.env.DATABASE_URL, "DATABASE_URL"),
  jwtSecret: must(process.env.JWT_SECRET, "JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripeSuccessUrl: process.env.STRIPE_SUCCESS_URL ?? "http://localhost:19006/subscription/success",
  stripeCancelUrl: process.env.STRIPE_CANCEL_URL ?? "http://localhost:19006/subscription/cancel",
  allowedOrigin: process.env.ALLOWED_ORIGIN ?? "*",
  guestVisibleOffersLimit: Number(process.env.GUEST_VISIBLE_OFFERS_LIMIT ?? 2),
  expoAccessToken: process.env.EXPO_ACCESS_TOKEN ?? "",
  notificationNearbyRadiusKm: Number(process.env.NOTIFICATION_NEARBY_RADIUS_KM ?? 20),
  googleClientIds: parseCsv(process.env.GOOGLE_CLIENT_IDS),
  appleAudiences: parseCsv(process.env.APPLE_AUDIENCES),
  enableReminderJobs: (process.env.ENABLE_REMINDER_JOBS ?? "true").toLowerCase() === "true",
  reminderCron: process.env.REMINDER_CRON ?? "0 * * * *",
  subscriptionReminderDays: Number(process.env.SUBSCRIPTION_REMINDER_DAYS ?? 3)
};
