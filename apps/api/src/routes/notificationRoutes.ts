import { Router } from "express";
import { z } from "zod";
import { Role } from "@prisma/client";
import { requireAuth, requireRole } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import {
  registerDevice,
  runReminderJobsNow,
  sendTestPush,
  unregisterDevice
} from "../controllers/notificationController";

const registerDeviceSchema = z.object({
  expoPushToken: z.string().min(8),
  platform: z.enum(["ios", "android", "web", "unknown"]).optional(),
  locale: z.string().optional(),
  city: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

export const notificationRouter = Router();

notificationRouter.post("/devices", requireAuth, validateBody(registerDeviceSchema), registerDevice);
notificationRouter.delete("/devices/:expoPushToken", requireAuth, unregisterDevice);
notificationRouter.post("/test", requireAuth, sendTestPush);
notificationRouter.post("/run-reminders", requireRole([Role.ADMIN]), runReminderJobsNow);
