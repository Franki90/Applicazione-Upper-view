import { DevicePlatform } from "@prisma/client";
import { Request, Response } from "express";
import {
  notifyVendorSubscriptionRenewal,
  registerPushDevice,
  removePushDevice,
  runExpiringOfferReminderJob,
  runSubscriptionReminderJob
} from "../services/notificationService";
import { prisma } from "../config/db";

const mapPlatform = (value?: string): DevicePlatform => {
  if (!value) return DevicePlatform.UNKNOWN;
  const normalized = value.toLowerCase();
  if (normalized === "ios") return DevicePlatform.IOS;
  if (normalized === "android") return DevicePlatform.ANDROID;
  if (normalized === "web") return DevicePlatform.WEB;
  return DevicePlatform.UNKNOWN;
};

export const registerDevice = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const { expoPushToken, platform, locale, city, latitude, longitude } = req.body;

  let device: Awaited<ReturnType<typeof registerPushDevice>>;
  try {
    device = await registerPushDevice({
      userId: req.user.id,
      expoPushToken,
      platform: mapPlatform(platform),
      locale,
      city,
      latitude,
      longitude
    });
  } catch (error) {
    res.status(400).json({ message: "Invalid push token payload" });
    return;
  }

  res.status(201).json(device);
};

export const unregisterDevice = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  await removePushDevice(req.user.id, req.params.expoPushToken);
  res.status(204).send();
};

export const sendTestPush = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      vendor: {
        userId: req.user.id
      }
    }
  });

  if (!subscription) {
    res.status(404).json({ message: "No vendor subscription found for this user" });
    return;
  }

  const notifications = await notifyVendorSubscriptionRenewal(
    req.user.id,
    subscription.id,
    subscription.currentPeriodEnd ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
  );

  res.json({ notifications });
};

export const runReminderJobsNow = async (_req: Request, res: Response): Promise<void> => {
  const [offers, subscriptions] = await Promise.all([
    runExpiringOfferReminderJob(),
    runSubscriptionReminderJob()
  ]);

  res.json({ offers, subscriptions });
};
