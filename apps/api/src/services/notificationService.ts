import { DevicePlatform, OfferStatus, SubscriptionStatus } from "@prisma/client";
import { prisma } from "../config/db";
import { env } from "../config/env";
import { distanceKm } from "../utils/geo";

type RegisterPushDeviceInput = {
  userId: string;
  expoPushToken: string;
  platform?: DevicePlatform;
  locale?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
};

type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  sound?: "default";
  data?: Record<string, unknown>;
};

const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

export const isExpoPushToken = (token: string): boolean => {
  return /^(Expo|Exponent)PushToken\[.+\]$/.test(token);
};

export const registerPushDevice = async (input: RegisterPushDeviceInput) => {
  if (!isExpoPushToken(input.expoPushToken)) {
    throw new Error("Invalid Expo push token format");
  }

  return prisma.pushDevice.upsert({
    where: { expoPushToken: input.expoPushToken },
    create: {
      userId: input.userId,
      expoPushToken: input.expoPushToken,
      platform: input.platform ?? DevicePlatform.UNKNOWN,
      locale: input.locale,
      city: input.city,
      latitude: input.latitude,
      longitude: input.longitude
    },
    update: {
      userId: input.userId,
      platform: input.platform ?? DevicePlatform.UNKNOWN,
      locale: input.locale,
      city: input.city,
      latitude: input.latitude,
      longitude: input.longitude,
      lastSeenAt: new Date()
    }
  });
};

export const removePushDevice = async (userId: string, expoPushToken: string) => {
  return prisma.pushDevice.deleteMany({
    where: {
      userId,
      expoPushToken
    }
  });
};

const sendExpoMessages = async (messages: ExpoPushMessage[]) => {
  if (messages.length === 0) return;

  const groups = chunk(messages, 100);

  for (const group of groups) {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(env.expoAccessToken ? { Authorization: `Bearer ${env.expoAccessToken}` } : {})
      },
      body: JSON.stringify(group)
    });
  }
};

const buildOfferMessage = (params: {
  title: string;
  body: string;
  offerId: string;
  reason: "new_offer" | "expiring_offer";
}) => {
  return {
    title: params.title,
    body: params.body,
    sound: "default" as const,
    data: {
      type: params.reason,
      offerId: params.offerId
    }
  };
};

export const notifyUsersNearOffer = async (
  offerId: string,
  reason: "new_offer" | "expiring_offer"
): Promise<number> => {
  const offer = await prisma.offer.findUnique({ where: { id: offerId } });
  if (!offer || offer.status !== OfferStatus.APPROVED) {
    return 0;
  }

  const devices = await prisma.pushDevice.findMany({
    where: {
      user: {
        role: "CUSTOMER",
        notificationsOptIn: true
      }
    },
    include: {
      user: {
        select: {
          id: true
        }
      }
    }
  });

  const nearDevices = devices.filter((device) => {
    if (
      device.latitude !== null &&
      device.longitude !== null &&
      offer.latitude !== null &&
      offer.longitude !== null
    ) {
      return (
        distanceKm(device.latitude, device.longitude, offer.latitude, offer.longitude) <=
        env.notificationNearbyRadiusKm
      );
    }

    if (device.city && offer.city) {
      return device.city.toLowerCase() === offer.city.toLowerCase();
    }

    return false;
  });

  if (nearDevices.length === 0) {
    return 0;
  }

  const payload =
    reason === "new_offer"
      ? buildOfferMessage({
          offerId,
          reason,
          title: "Nuova offerta vicina a te",
          body: `${offer.title} a ${offer.city}`
        })
      : buildOfferMessage({
          offerId,
          reason,
          title: "Offerta in scadenza",
          body: `${offer.title} scade presto`
        });

  const messages: ExpoPushMessage[] = nearDevices.map((device) => ({
    to: device.expoPushToken,
    ...payload
  }));

  await sendExpoMessages(messages);
  return messages.length;
};

export const notifyVendorSubscriptionRenewal = async (
  userId: string,
  subscriptionId: string,
  periodEnd: Date
): Promise<number> => {
  const devices = await prisma.pushDevice.findMany({
    where: {
      userId,
      user: {
        notificationsOptIn: true
      }
    }
  });

  if (devices.length === 0) {
    return 0;
  }

  const bodyDate = periodEnd.toISOString().split("T")[0];
  const messages: ExpoPushMessage[] = devices.map((device) => ({
    to: device.expoPushToken,
    title: "Promemoria abbonamento vendor",
    body: `Il tuo piano scade il ${bodyDate}. Rinnova per continuare a pubblicare offerte.`,
    sound: "default",
    data: {
      type: "subscription_renewal",
      subscriptionId
    }
  }));

  await sendExpoMessages(messages);
  return messages.length;
};

export const runExpiringOfferReminderJob = async (): Promise<{ offers: number; notifications: number }> => {
  const now = new Date();
  const limit = new Date(now.getTime() + 1000 * 60 * 60 * 48);

  const expiringOffers = await prisma.offer.findMany({
    where: {
      status: OfferStatus.APPROVED,
      OR: [
        {
          endDate: {
            gt: now,
            lte: limit
          }
        },
        {
          validUntil: {
            gt: now,
            lte: limit
          }
        }
      ],
      expiringReminderSentAt: null
    }
  });

  let notifications = 0;

  for (const offer of expiringOffers) {
    notifications += await notifyUsersNearOffer(offer.id, "expiring_offer");
    await prisma.offer.update({
      where: { id: offer.id },
      data: { expiringReminderSentAt: new Date() }
    });
  }

  return {
    offers: expiringOffers.length,
    notifications
  };
};

export const runSubscriptionReminderJob = async (): Promise<{ subscriptions: number; notifications: number }> => {
  const now = new Date();
  const limit = new Date(now.getTime() + 1000 * 60 * 60 * 24 * env.subscriptionReminderDays);

  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: {
        gte: now,
        lte: limit
      },
      renewalReminderSentAt: null
    },
    include: {
      vendor: {
        select: {
          userId: true
        }
      }
    }
  });

  let notifications = 0;

  for (const subscription of subscriptions) {
    if (!subscription.currentPeriodEnd) {
      continue;
    }

    notifications += await notifyVendorSubscriptionRenewal(
      subscription.vendor.userId,
      subscription.id,
      subscription.currentPeriodEnd
    );

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { renewalReminderSentAt: new Date() }
    });
  }

  return {
    subscriptions: subscriptions.length,
    notifications
  };
};
