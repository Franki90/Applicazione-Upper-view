import { Role, SubscriptionStatus } from "@prisma/client";
import { Request, Response } from "express";
import Stripe from "stripe";
import { prisma } from "../config/db";
import { env } from "../config/env";
import {
  createVendorCheckoutSession,
  hasActiveVendorSubscription,
  stripeClient,
  upsertVendorSubscription,
  vendorPlan
} from "../services/subscriptionService";

export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== Role.VENDOR) {
    res.status(403).json({ message: "Vendor account required" });
    return;
  }

  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: req.user.id },
    include: { user: true }
  });

  if (!vendor) {
    res.status(404).json({ message: "Vendor profile not found" });
    return;
  }

  const session = await createVendorCheckoutSession({
    vendorId: vendor.id,
    email: vendor.user.email
  });

  res.json({
    checkoutUrl: session.url,
    priceCents: vendorPlan.monthlyPriceCents,
    currency: vendorPlan.currency.toUpperCase(),
    plan: "CHF 25/month"
  });
};

export const getSubscriptionStatus = async (req: Request, res: Response): Promise<void> => {
  const vendorId = req.params.vendorId;

  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const vendor = await prisma.vendorProfile.findUnique({ where: { id: vendorId } });
  if (!vendor) {
    res.status(404).json({ message: "Vendor profile not found" });
    return;
  }

  if (req.user.role === Role.VENDOR && vendor.userId !== req.user.id) {
    res.status(403).json({ message: "Cannot access another vendor subscription" });
    return;
  }

  const active = await hasActiveVendorSubscription(vendor.id);
  const subscription = await prisma.subscription.findUnique({ where: { vendorId: vendor.id } });

  res.json({
    active,
    status: subscription?.status ?? SubscriptionStatus.INACTIVE,
    subscription,
    canPublishOffers: active
  });
};

export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {
  if (!stripeClient) {
    res.status(400).json({ message: "Stripe is not configured" });
    return;
  }

  const signature = req.headers["stripe-signature"];
  if (!signature || typeof signature !== "string") {
    res.status(400).json({ message: "Missing Stripe signature" });
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripeClient.webhooks.constructEvent(req.body, signature, env.stripeWebhookSecret);
  } catch (_error) {
    res.status(400).json({ message: "Invalid Stripe webhook signature" });
    return;
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

    const sessions = await stripeClient.checkout.sessions.list({
      customer: customerId,
      limit: 1
    });

    const vendorId = sessions.data[0]?.metadata?.vendorId;
    if (vendorId) {
      await upsertVendorSubscription({
        vendorId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripeStatus: subscription.status,
        currentPeriodEnd: subscription.current_period_end
      });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: { status: SubscriptionStatus.CANCELED, canceledAt: new Date() }
    });
  }

  res.json({ received: true });
};
