import { Router } from "express";
import {
  createCheckoutSession,
  getSubscriptionStatus
} from "../controllers/subscriptionController";
import { requireRole } from "../middleware/auth";
import { Role } from "@prisma/client";

export const subscriptionRouter = Router();

subscriptionRouter.post("/create-checkout-session", requireRole([Role.VENDOR]), createCheckoutSession);
subscriptionRouter.post("/checkout-session", requireRole([Role.VENDOR]), createCheckoutSession);
subscriptionRouter.get("/status/:vendorId", getSubscriptionStatus);
