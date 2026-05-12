import {
  CouponBorderStyle,
  CouponLayout,
  CouponPattern,
  CouponStatus,
  CouponType,
  OfferStatus,
  Role
} from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../config/db";
import { buildCouponQrValue, generateCouponCode } from "../services/couponService";

const ensureVendorAndOffer = async (userId: string, offerId: string) => {
  const vendor = await prisma.vendorProfile.findUnique({ where: { userId } });
  if (!vendor) {
    return { vendor: null, offer: null };
  }

  const offer = await prisma.offer.findUnique({ where: { id: offerId } });
  if (!offer || offer.vendorId !== vendor.id) {
    return { vendor, offer: null };
  }

  return { vendor, offer };
};

const pickString = (value: unknown): string | undefined => {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
};

const parseDate = (value: unknown): Date | null => {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }
  return new Date(value);
};

const couponCodeAvailable = async (couponCode: string): Promise<boolean> => {
  const existing = await prisma.coupon.findUnique({ where: { couponCode } });
  return !existing;
};

const resolveUniqueCouponCode = async (params: {
  requestedCode?: string;
  businessName: string;
  offerTitle: string;
}): Promise<string> => {
  if (params.requestedCode) {
    const normalized = params.requestedCode.toUpperCase().replace(/\s+/g, "-");
    if (await couponCodeAvailable(normalized)) {
      return normalized;
    }
  }

  for (let i = 0; i < 10; i += 1) {
    const generated = generateCouponCode(params.businessName, params.offerTitle);
    if (await couponCodeAvailable(generated)) {
      return generated;
    }
  }

  throw new Error("Unable to generate a unique coupon code");
};

const payloadToCouponDesign = (payload: Record<string, unknown>) => {
  const layout = (pickString(payload.layout) as CouponLayout | undefined) ?? CouponLayout.CLASSIC;
  const pattern = (pickString(payload.pattern) as CouponPattern | undefined) ?? CouponPattern.MINIMAL;
  const borderStyle =
    (pickString(payload.borderStyle) as CouponBorderStyle | undefined) ?? CouponBorderStyle.SOLID;

  return { layout, pattern, borderStyle };
};

export const generateCoupon = async (req: Request, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== Role.VENDOR) {
    res.status(403).json({ message: "Vendor account required" });
    return;
  }

  const payload = req.body as Record<string, unknown>;
  const offerId = pickString(payload.offerId);
  if (!offerId) {
    res.status(400).json({ message: "offerId is required" });
    return;
  }

  const { vendor, offer } = await ensureVendorAndOffer(req.user.id, offerId);
  if (!vendor || !offer) {
    res.status(404).json({ message: "Offer not found for this vendor" });
    return;
  }

  let couponCode: string;
  try {
    couponCode = await resolveUniqueCouponCode({
      requestedCode: pickString(payload.couponCode),
      businessName: vendor.businessName,
      offerTitle: offer.title
    });
  } catch (_error) {
    res.status(500).json({ message: "Unable to generate coupon code" });
    return;
  }

  const design = payloadToCouponDesign(payload);
  const title = pickString(payload.title) ?? `${offer.title} Coupon`;
  const subtitle = pickString(payload.subtitle);
  const qrCodeUrl = pickString(payload.qrCodeUrl) ?? buildCouponQrValue(couponCode);
  const couponImageUrl = pickString(payload.couponImageUrl) ?? null;
  const couponPdfUrl = pickString(payload.couponPdfUrl) ?? null;
  const terms = pickString(payload.terms) ?? offer.terms;
  const maxDownloads =
    typeof payload.maxDownloads === "number" && payload.maxDownloads > 0
      ? Math.floor(payload.maxDownloads)
      : offer.maxCouponDownloads;

  const created = await prisma.coupon.create({
    data: {
      offerId: offer.id,
      vendorId: vendor.id,
      type: CouponType.GENERATED,
      title,
      subtitle,
      couponCode,
      qrCodeUrl,
      couponImageUrl,
      couponPdfUrl,
      uploadedFileUrl: null,
      layout: design.layout,
      pattern: design.pattern,
      primaryColor: pickString(payload.primaryColor) ?? vendor.primaryColor,
      secondaryColor: pickString(payload.secondaryColor) ?? vendor.secondaryColor,
      textColor: pickString(payload.textColor) ?? "#111827",
      backgroundColor: pickString(payload.backgroundColor) ?? vendor.backgroundColor,
      borderStyle: design.borderStyle,
      validityStart: parseDate(payload.validityStart) ?? offer.startDate,
      validityEnd: parseDate(payload.validityEnd) ?? offer.endDate ?? offer.validUntil,
      terms,
      maxDownloads
    }
  });

  res.status(201).json({
    message: "Coupon generated",
    coupon: created
  });
};

export const uploadCoupon = async (req: Request, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== Role.VENDOR) {
    res.status(403).json({ message: "Vendor account required" });
    return;
  }

  const payload = req.body as Record<string, unknown>;
  const offerId = pickString(payload.offerId);
  const uploadedFileUrl = pickString(payload.uploadedFileUrl);

  if (!offerId || !uploadedFileUrl) {
    res.status(400).json({ message: "offerId and uploadedFileUrl are required" });
    return;
  }

  const { vendor, offer } = await ensureVendorAndOffer(req.user.id, offerId);
  if (!vendor || !offer) {
    res.status(404).json({ message: "Offer not found for this vendor" });
    return;
  }

  let couponCode: string;
  try {
    couponCode = await resolveUniqueCouponCode({
      requestedCode: pickString(payload.couponCode),
      businessName: vendor.businessName,
      offerTitle: offer.title
    });
  } catch (_error) {
    res.status(500).json({ message: "Unable to generate coupon code" });
    return;
  }

  const design = payloadToCouponDesign(payload);
  const title = pickString(payload.title) ?? `${offer.title} Coupon`;
  const subtitle = pickString(payload.subtitle);
  const qrCodeUrl = pickString(payload.qrCodeUrl) ?? buildCouponQrValue(couponCode);
  const terms = pickString(payload.terms) ?? offer.terms;
  const maxDownloads =
    typeof payload.maxDownloads === "number" && payload.maxDownloads > 0
      ? Math.floor(payload.maxDownloads)
      : offer.maxCouponDownloads;

  const created = await prisma.coupon.create({
    data: {
      offerId: offer.id,
      vendorId: vendor.id,
      type: CouponType.UPLOADED,
      title,
      subtitle,
      couponCode,
      qrCodeUrl,
      couponImageUrl: pickString(payload.couponImageUrl) ?? uploadedFileUrl,
      couponPdfUrl: pickString(payload.couponPdfUrl) ?? null,
      uploadedFileUrl,
      layout: design.layout,
      pattern: design.pattern,
      primaryColor: pickString(payload.primaryColor) ?? vendor.primaryColor,
      secondaryColor: pickString(payload.secondaryColor) ?? vendor.secondaryColor,
      textColor: pickString(payload.textColor) ?? "#111827",
      backgroundColor: pickString(payload.backgroundColor) ?? vendor.backgroundColor,
      borderStyle: design.borderStyle,
      validityStart: parseDate(payload.validityStart) ?? offer.startDate,
      validityEnd: parseDate(payload.validityEnd) ?? offer.endDate ?? offer.validUntil,
      terms,
      maxDownloads
    }
  });

  res.status(201).json({
    message: "Coupon uploaded",
    coupon: created
  });
};

export const getCouponById = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const coupon = await prisma.coupon.findUnique({
    where: { id: req.params.couponId },
    include: {
      offer: {
        select: {
          id: true,
          title: true,
          status: true,
          startDate: true,
          endDate: true,
          validUntil: true,
          usageLimitPerCustomer: true
        }
      },
      vendor: {
        select: {
          id: true,
          userId: true,
          businessName: true,
          logoUrl: true
        }
      }
    }
  });

  if (!coupon) {
    res.status(404).json({ message: "Coupon not found" });
    return;
  }

  if (req.user.role === Role.VENDOR && coupon.vendor.userId !== req.user.id) {
    res.status(403).json({ message: "Cannot access another vendor coupon" });
    return;
  }

  if (req.user.role === Role.CUSTOMER) {
    const redemption = await prisma.couponRedemption.findUnique({
      where: {
        couponId_userId: {
          couponId: coupon.id,
          userId: req.user.id
        }
      }
    });

    if (!redemption && coupon.offer.status !== OfferStatus.APPROVED) {
      res.status(403).json({ message: "Coupon is not available" });
      return;
    }
  }

  res.json(coupon);
};

export const downloadCoupon = async (req: Request, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== Role.CUSTOMER) {
    res.status(403).json({ message: "Only registered customers can download coupons" });
    return;
  }

  const coupon = await prisma.coupon.findUnique({
    where: { id: req.params.couponId },
    include: {
      offer: {
        select: {
          id: true,
          status: true,
          usageLimitPerCustomer: true
        }
      }
    }
  });

  if (!coupon || coupon.offer.status !== OfferStatus.APPROVED) {
    res.status(404).json({ message: "Coupon not available" });
    return;
  }

  const existing = await prisma.couponRedemption.findUnique({
    where: {
      couponId_userId: {
        couponId: coupon.id,
        userId: req.user.id
      }
    }
  });

  if (existing) {
    res.json({
      message: "Coupon already saved",
      couponId: coupon.id,
      couponCode: coupon.couponCode,
      qrCodeUrl: coupon.qrCodeUrl ?? buildCouponQrValue(coupon.couponCode),
      couponImageUrl: coupon.couponImageUrl,
      couponPdfUrl: coupon.couponPdfUrl,
      status: existing.status
    });
    return;
  }

  if (coupon.maxDownloads > 0 && coupon.downloadCount >= coupon.maxDownloads) {
    res.status(409).json({ message: "Coupon download limit reached" });
    return;
  }

  const customerUsageCount = await prisma.couponRedemption.count({
    where: {
      userId: req.user.id,
      coupon: {
        offerId: coupon.offer.id
      }
    }
  });

  if (customerUsageCount >= coupon.offer.usageLimitPerCustomer) {
    res.status(409).json({ message: "Usage limit per customer reached for this offer" });
    return;
  }

  const redemption = await prisma.$transaction(async (tx) => {
    const created = await tx.couponRedemption.create({
      data: {
        couponId: coupon.id,
        userId: req.user!.id,
        status: CouponStatus.DOWNLOADED
      }
    });

    await tx.coupon.update({
      where: { id: coupon.id },
      data: {
        downloadCount: { increment: 1 }
      }
    });

    await tx.offer.update({
      where: { id: coupon.offer.id },
      data: {
        downloadsCount: { increment: 1 }
      }
    });

    return created;
  });

  res.status(201).json({
    message: "Coupon downloaded",
    couponId: coupon.id,
    couponCode: coupon.couponCode,
    qrCodeUrl: coupon.qrCodeUrl ?? buildCouponQrValue(coupon.couponCode),
    couponImageUrl: coupon.couponImageUrl,
    couponPdfUrl: coupon.couponPdfUrl,
    terms: coupon.terms,
    validityStart: coupon.validityStart,
    validityEnd: coupon.validityEnd,
    status: redemption.status
  });
};

export const markCouponAsUsed = async (req: Request, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== Role.CUSTOMER) {
    res.status(403).json({ message: "Only registered customers can use coupons" });
    return;
  }

  const redemption = await prisma.couponRedemption.findUnique({
    where: {
      couponId_userId: {
        couponId: req.params.couponId,
        userId: req.user.id
      }
    }
  });

  if (!redemption) {
    res.status(404).json({ message: "Coupon not found in your wallet" });
    return;
  }

  if (redemption.status === CouponStatus.USED) {
    res.json({
      message: "Coupon already marked as used",
      redemption
    });
    return;
  }

  const updated = await prisma.couponRedemption.update({
    where: { id: redemption.id },
    data: {
      status: CouponStatus.USED,
      usedAt: new Date()
    }
  });

  res.json({
    message: "Coupon marked as used",
    redemption: updated
  });
};
