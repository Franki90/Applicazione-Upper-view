import Stripe from "stripe";
import { SubscriptionStatus } from "@prisma/client";
import { prisma } from "../config/db";
import { env } from "../config/env";

const stripe = env.stripeSecretKey
  ? new Stripe(env.stripeSecretKey, {
      apiVersion: "2025-02-24.acacia"
    })
  : null;

export const vendorPlan = {
  monthlyPriceCents: 2500,
  currency: "chf"
};

export const createVendorCheckoutSession = async (params: {
  vendorId: string;
  email: string;
}): Promise<{ url: string }> => {
  if (!stripe) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY in .env");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: params.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: vendorPlan.currency,
          recurring: { interval: "month" },
          product_data: {
            name: "Ticino Deals Vendor Subscription"
          },
          unit_amount: vendorPlan.monthlyPriceCents
        }
      }
    ],
    metadata: {
      vendorId: params.vendorId
    },
    success_url: env.stripeSuccessUrl,
    cancel_url: env.stripeCancelUrl
  });

  if (!session.url) {
    throw new Error("Could not create Stripe session URL");
  }

  return { url: session.url };
};

const mapStripeStatus = (stripeStatus: Stripe.Subscription.Status): SubscriptionStatus => {
  if (stripeStatus === "active") return SubscriptionStatus.ACTIVE;
  if (stripeStatus === "past_due") return SubscriptionStatus.PAST_DUE;
  if (stripeStatus === "canceled") return SubscriptionStatus.CANCELED;
  if (stripeStatus === "unpaid") return SubscriptionStatus.EXPIRED;
  return SubscriptionStatus.INACTIVE;
};

export const upsertVendorSubscription = async (input: {
  vendorId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId: string;
  stripeStatus: Stripe.Subscription.Status;
  currentPeriodEnd?: number;
}) => {
  return prisma.subscription.upsert({
    where: { vendorId: input.vendorId },
    create: {
      vendorId: input.vendorId,
      stripeCustomerId: input.stripeCustomerId,
      stripeSubscriptionId: input.stripeSubscriptionId,
      status: mapStripeStatus(input.stripeStatus),
      monthlyPriceCents: vendorPlan.monthlyPriceCents,
      currency: vendorPlan.currency.toUpperCase(),
      currentPeriodEnd: input.currentPeriodEnd
        ? new Date(input.currentPeriodEnd * 1000)
        : null,
      startedAt: new Date()
    },
    update: {
      stripeCustomerId: input.stripeCustomerId,
      stripeSubscriptionId: input.stripeSubscriptionId,
      status: mapStripeStatus(input.stripeStatus),
      renewalReminderSentAt: null,
      currentPeriodEnd: input.currentPeriodEnd
        ? new Date(input.currentPeriodEnd * 1000)
        : null
    }
  });
};

export const hasActiveVendorSubscription = async (vendorId: string): Promise<boolean> => {
  const now = new Date();
  const subscription = await prisma.subscription.findUnique({
    where: { vendorId }
  });

  if (!subscription) return false;
  if (subscription.status !== SubscriptionStatus.ACTIVE) return false;
  if (!subscription.currentPeriodEnd) return true;

  return subscription.currentPeriodEnd >= now;
};

export const stripeClient = stripe;
