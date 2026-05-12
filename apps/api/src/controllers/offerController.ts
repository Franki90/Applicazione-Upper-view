import { OfferStatus, Prisma, Role } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../config/db";
import { env } from "../config/env";
import { distanceKm } from "../utils/geo";
import { hasActiveVendorSubscription } from "../services/subscriptionService";

const requiredOfferFieldsFilled = (offer: {
  title: string;
  category: string;
  categoryIds: string[];
  description: string;
  includedItems: unknown;
  terms: string | null;
  originalPrice: number | null;
  discountedPrice: number | null;
  discountPercentage: number | null;
  startDate: Date | null;
  endDate: Date | null;
  location: string | null;
  imageUrls: unknown;
  maxCouponDownloads: number;
  usageLimitPerCustomer: number;
}): boolean => {
  const hasItems = Array.isArray(offer.includedItems) && offer.includedItems.length > 0;
  const hasImages = Array.isArray(offer.imageUrls) && offer.imageUrls.length > 0;

  return Boolean(
      offer.title &&
      offer.category &&
      offer.categoryIds.length > 0 &&
      offer.description &&
      hasItems &&
      offer.terms &&
      offer.originalPrice !== null &&
      offer.discountedPrice !== null &&
      offer.discountPercentage !== null &&
      offer.startDate &&
      offer.endDate &&
      offer.location &&
      hasImages &&
      offer.maxCouponDownloads > 0 &&
      offer.usageLimitPerCustomer > 0
  );
};

const parseCategoryFilter = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return Array.from(new Set(value.flatMap((item) => String(item).split(",").map((id) => id.trim())).filter(Boolean)));
  }
  return Array.from(new Set(String(value).split(",").map((item) => item.trim()).filter(Boolean)));
};

const dedupeIds = (ids: string[] | undefined): string[] => {
  if (!ids) return [];
  return Array.from(new Set(ids.filter(Boolean)));
};

const validCategoryIds = async (ids: string[]): Promise<string[]> => {
  if (ids.length === 0) return [];
  const categories = await prisma.category.findMany({
    where: { id: { in: ids } },
    select: { id: true }
  });
  return categories.map((item) => item.id);
};

export const listOffers = async (req: Request, res: Response): Promise<void> => {
  const isGuest = !req.user;
  const role = req.user?.role;
  const userId = req.user?.id;

  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const categoriesFilter = parseCategoryFilter(req.query.categories ?? category);
  const location = typeof req.query.location === "string" ? req.query.location : undefined;
  const expiringSoon = req.query.expiringSoon === "true";
  const lat = req.query.lat ? Number(req.query.lat) : undefined;
  const lng = req.query.lng ? Number(req.query.lng) : undefined;
  const maxDistance = req.query.maxDistance ? Number(req.query.maxDistance) : undefined;

  const now = new Date();
  const soonLimit = new Date(now);
  soonLimit.setDate(soonLimit.getDate() + 7);

  const whereConditions: Prisma.OfferWhereInput[] = [];
  if (role === Role.VENDOR) {
    whereConditions.push({
      OR: [{ status: OfferStatus.APPROVED }, { vendor: { userId } }]
    });
  } else {
    whereConditions.push({ status: OfferStatus.APPROVED });
  }

  if (categoriesFilter.length > 0) {
    whereConditions.push({
      OR: [{ categoryIds: { hasSome: categoriesFilter } }, { category: { in: categoriesFilter } }]
    });
  }

  if (location) {
    whereConditions.push({
      OR: [
        { location: { contains: location, mode: "insensitive" } },
        { city: { contains: location, mode: "insensitive" } }
      ]
    });
  }

  if (expiringSoon) {
    whereConditions.push({
      OR: [
        { endDate: { lte: soonLimit, gte: now } },
        { validUntil: { lte: soonLimit, gte: now } }
      ]
    });
  }

  const offers = await prisma.offer.findMany({
    where: { AND: whereConditions },
    orderBy: [{ downloadsCount: "desc" }, { createdAt: "desc" }],
    include: {
      vendor: {
        select: {
          businessName: true,
          logoUrl: true,
          primaryColor: true,
          secondaryColor: true,
          accentColor: true,
          backgroundColor: true
        }
      }
    }
  });

  let filtered = offers;
  if (lat !== undefined && lng !== undefined && maxDistance !== undefined) {
    filtered = offers.filter((offer) => {
      if (offer.latitude === null || offer.longitude === null) return false;
      return distanceKm(lat, lng, offer.latitude, offer.longitude) <= maxDistance;
    });
  }

  let userPreferences: string[] = [];
  if (req.user?.role === Role.CUSTOMER) {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { selectedCategoryIds: true }
    });
    userPreferences = user?.selectedCategoryIds ?? [];
  }

  filtered = filtered
    .map((offer) => {
      const distance =
        lat !== undefined &&
        lng !== undefined &&
        offer.latitude !== null &&
        offer.longitude !== null
          ? distanceKm(lat, lng, offer.latitude, offer.longitude)
          : Number.POSITIVE_INFINITY;
      const expiresAt = offer.endDate ?? offer.validUntil;
      const expiresValue = expiresAt ? expiresAt.getTime() : Number.POSITIVE_INFINITY;
      const categoryMatch =
        userPreferences.length > 0 && offer.categoryIds.some((id) => userPreferences.includes(id)) ? 1 : 0;

      return {
        ...offer,
        __distance: distance,
        __expiresValue: expiresValue,
        __categoryMatch: categoryMatch
      };
    })
    .sort((a, b) => {
      if (role === Role.CUSTOMER && userPreferences.length > 0) {
        if (a.__categoryMatch !== b.__categoryMatch) return b.__categoryMatch - a.__categoryMatch;
      }
      if (a.__distance !== b.__distance) return a.__distance - b.__distance;
      if (a.downloadsCount !== b.downloadsCount) return b.downloadsCount - a.downloadsCount;
      if (a.__expiresValue !== b.__expiresValue) return a.__expiresValue - b.__expiresValue;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  if (isGuest) {
    filtered = filtered.slice(0, env.guestVisibleOffersLimit);
  }

  const responseItems = filtered.map(({ __distance, __expiresValue, __categoryMatch, ...offer }) => offer);

  res.json({
    role: req.user?.role ?? "GUEST",
    items: responseItems
  });
};

export const getOfferById = async (req: Request, res: Response): Promise<void> => {
  const offer = await prisma.offer.findUnique({
    where: { id: req.params.offerId ?? req.params.id },
    include: {
      vendor: {
        select: {
          userId: true,
          businessName: true,
          logoUrl: true,
          primaryColor: true,
          secondaryColor: true,
          accentColor: true,
          backgroundColor: true
        }
      },
      coupons: true
    }
  });

  if (!offer) {
    res.status(404).json({ message: "Offer not found" });
    return;
  }

  const canAccess =
    offer.status === OfferStatus.APPROVED ||
    req.user?.role === Role.ADMIN ||
    (req.user?.role === Role.VENDOR && offer.vendor.userId === req.user.id);

  if (!canAccess) {
    res.status(404).json({ message: "Offer not found" });
    return;
  }

  await prisma.offer.update({
    where: { id: offer.id },
    data: {
      viewsCount: { increment: 1 },
      views: req.user
        ? {
            create: {
              userId: req.user.id
            }
          }
        : undefined
    }
  });

  res.json(offer);
};

export const createOffer = async (req: Request, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== Role.VENDOR) {
    res.status(403).json({ message: "Vendor account required" });
    return;
  }

  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: req.user.id } });
  if (!vendor) {
    res.status(404).json({ message: "Vendor profile not found" });
    return;
  }

  const payload = req.body;
  const requestedCategoryIds = dedupeIds(payload.categoryIds);
  const categoryIds = requestedCategoryIds.length > 0 ? requestedCategoryIds : vendor.categoryIds;
  const validatedCategoryIds = await validCategoryIds(categoryIds);
  if (validatedCategoryIds.length !== categoryIds.length || validatedCategoryIds.length === 0) {
    res.status(400).json({ message: "At least one valid categoryId is required" });
    return;
  }

  const endDate = payload.endDate ? new Date(payload.endDate) : null;
  const startDate = payload.startDate ? new Date(payload.startDate) : null;
  const discountPercentage =
    payload.discountPercentage ??
    (payload.originalPrice !== null &&
    payload.originalPrice !== undefined &&
    payload.discountedPrice !== null &&
    payload.discountedPrice !== undefined
      ? Number((((payload.originalPrice - payload.discountedPrice) / payload.originalPrice) * 100).toFixed(2))
      : null);

  const offer = await prisma.offer.create({
    data: {
      vendorId: vendor.id,
      title: payload.title,
      category: payload.category ?? validatedCategoryIds[0],
      categoryIds: validatedCategoryIds,
      description: payload.description,
      includedItems: payload.includedItems,
      terms: payload.terms,
      originalPrice: payload.originalPrice,
      discountedPrice: payload.discountedPrice,
      discountPercentage,
      startDate,
      endDate,
      validUntil: endDate,
      location: payload.location,
      city: payload.city,
      latitude: payload.latitude,
      longitude: payload.longitude,
      imageUrls: payload.imageUrls,
      images: payload.imageUrls,
      maxCouponDownloads: payload.maxCouponDownloads,
      usageLimitPerCustomer: payload.usageLimitPerCustomer,
      status: OfferStatus.DRAFT,
      expiringReminderSentAt: null
    }
  });

  res.status(201).json({
    message: "Offer draft created",
    offer
  });
};

export const updateOffer = async (req: Request, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== Role.VENDOR) {
    res.status(403).json({ message: "Vendor account required" });
    return;
  }

  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: req.user.id } });
  if (!vendor) {
    res.status(404).json({ message: "Vendor profile not found" });
    return;
  }

  const offerId = req.params.offerId ?? req.params.id;

  const existing = await prisma.offer.findUnique({ where: { id: offerId } });
  if (!existing || existing.vendorId !== vendor.id) {
    res.status(404).json({ message: "Offer not found" });
    return;
  }

  const payload = req.body;
  const requestedCategoryIds = payload.categoryIds ? dedupeIds(payload.categoryIds) : existing.categoryIds;
  const validatedCategoryIds = await validCategoryIds(requestedCategoryIds);
  if (validatedCategoryIds.length !== requestedCategoryIds.length || validatedCategoryIds.length === 0) {
    res.status(400).json({ message: "At least one valid categoryId is required" });
    return;
  }

  const discountPercentage =
    payload.discountPercentage ??
    (payload.originalPrice !== null &&
    payload.originalPrice !== undefined &&
    payload.discountedPrice !== null &&
    payload.discountedPrice !== undefined
      ? Number((((payload.originalPrice - payload.discountedPrice) / payload.originalPrice) * 100).toFixed(2))
      : undefined);

  const updated = await prisma.offer.update({
    where: { id: offerId },
    data: {
      ...payload,
      category: payload.category ?? validatedCategoryIds[0] ?? existing.category,
      categoryIds: validatedCategoryIds,
      ...(discountPercentage !== undefined ? { discountPercentage } : {}),
      ...(payload.startDate ? { startDate: new Date(payload.startDate) } : {}),
      ...(payload.endDate
        ? {
            endDate: new Date(payload.endDate),
            validUntil: new Date(payload.endDate)
          }
        : {}),
      ...(payload.imageUrls
        ? {
            imageUrls: payload.imageUrls,
            images: payload.imageUrls
          }
        : {}),
      status: OfferStatus.DRAFT,
      expiringReminderSentAt: null
    }
  });

  res.json({
    message: "Offer draft updated",
    offer: updated
  });
};

export const deleteOffer = async (req: Request, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== Role.VENDOR) {
    res.status(403).json({ message: "Vendor account required" });
    return;
  }

  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: req.user.id } });
  if (!vendor) {
    res.status(404).json({ message: "Vendor profile not found" });
    return;
  }

  const offerId = req.params.offerId ?? req.params.id;
  const existing = await prisma.offer.findUnique({ where: { id: offerId } });
  if (!existing || existing.vendorId !== vendor.id) {
    res.status(404).json({ message: "Offer not found" });
    return;
  }

  await prisma.offer.delete({ where: { id: offerId } });
  res.status(204).send();
};

export const publishOffer = async (req: Request, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== Role.VENDOR) {
    res.status(403).json({ message: "Vendor account required" });
    return;
  }

  const offerId = req.params.offerId;
  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: req.user.id } });
  if (!vendor) {
    res.status(404).json({ message: "Vendor profile not found" });
    return;
  }

  const offer = await prisma.offer.findUnique({ where: { id: offerId } });
  if (!offer || offer.vendorId !== vendor.id) {
    res.status(404).json({ message: "Offer not found" });
    return;
  }

  if (!vendor.isProfileCompleted) {
    res.status(400).json({ message: "Vendor profile is incomplete" });
    return;
  }

  const active = await hasActiveVendorSubscription(vendor.id);
  if (!active) {
    res.status(402).json({
      message: "Subscription inactive. Activate CHF 25/month subscription to publish offers.",
      subscriptionStatus: "inactive"
    });
    return;
  }

  const couponExists = await prisma.coupon.count({ where: { offerId: offer.id, vendorId: vendor.id } });
  if (couponExists === 0) {
    res.status(400).json({ message: "Offer requires at least one coupon before publishing" });
    return;
  }

  if (!requiredOfferFieldsFilled(offer)) {
    res.status(400).json({ message: "Offer fields are incomplete" });
    return;
  }

  const updated = await prisma.offer.update({
    where: { id: offer.id },
    data: {
      status: OfferStatus.PENDING
    }
  });

  res.json({
    message: "Offer submitted for publication",
    offer: updated
  });
};

