import { OfferStatus } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../config/db";
import { notifyUsersNearOffer } from "../services/notificationService";

export const listPendingOffers = async (_req: Request, res: Response): Promise<void> => {
  const offers = await prisma.offer.findMany({
    where: { status: OfferStatus.PENDING },
    include: {
      vendor: {
        select: {
          businessName: true,
          city: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  res.json(offers);
};

export const moderateOffer = async (req: Request, res: Response): Promise<void> => {
  const { status } = req.body as { status: OfferStatus.APPROVED | OfferStatus.REJECTED };

  const current = await prisma.offer.findUnique({ where: { id: req.params.id } });
  if (!current) {
    res.status(404).json({ message: "Offer not found" });
    return;
  }

  const updated = await prisma.offer.update({
    where: { id: req.params.id },
    data: { status }
  });

  let notifications = 0;
  if (current.status !== OfferStatus.APPROVED && status === OfferStatus.APPROVED) {
    notifications = await notifyUsersNearOffer(updated.id, "new_offer");
  }

  res.json({
    offer: updated,
    notifications
  });
};

export const adminAnalytics = async (_req: Request, res: Response): Promise<void> => {
  const [users, vendors, offers, coupons, pushDevices] = await Promise.all([
    prisma.user.count(),
    prisma.vendorProfile.count(),
    prisma.offer.count(),
    prisma.coupon.count(),
    prisma.pushDevice.count()
  ]);

  res.json({ users, vendors, offers, coupons, pushDevices });
};
