import { Role } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../config/db";
import { hasActiveVendorSubscription } from "../services/subscriptionService";

const profileCompletionFromData = (data: {
  businessName?: string | null;
  description?: string | null;
  category?: string | null;
  categoryIds?: string[] | null;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  email?: string | null;
  openingHours?: unknown;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  accentColor?: string | null;
  backgroundColor?: string | null;
}): boolean => {
  return Boolean(
      data.businessName &&
      data.description &&
      data.category &&
      data.categoryIds &&
      data.categoryIds.length > 0 &&
      data.address &&
      data.city &&
      data.phone &&
      data.email &&
      data.openingHours &&
      data.logoUrl &&
      data.primaryColor &&
      data.secondaryColor &&
      data.accentColor &&
      data.backgroundColor
  );
};

const ensureVendorUser = async (userId: string) => {
  return prisma.vendorProfile.findUnique({ where: { userId } });
};

const dedupeIds = (ids: string[] | undefined): string[] => {
  if (!ids) return [];
  return Array.from(new Set(ids.filter(Boolean)));
};

const existingCategoryIds = async (ids: string[]): Promise<string[]> => {
  if (ids.length === 0) return [];
  const categories = await prisma.category.findMany({
    where: { id: { in: ids } },
    select: { id: true }
  });
  return categories.map((item) => item.id);
};

export const createVendorProfile = async (req: Request, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== Role.VENDOR) {
    res.status(403).json({ message: "Vendor account required" });
    return;
  }

  const payload = req.body;
  const categoryIds = dedupeIds(payload.categoryIds);
  const validCategoryIds = await existingCategoryIds(categoryIds);

  if (categoryIds.length > 0 && validCategoryIds.length !== categoryIds.length) {
    res.status(400).json({ message: "One or more categoryIds are invalid" });
    return;
  }

  const category = payload.category ?? validCategoryIds[0] ?? null;
  const completed = profileCompletionFromData({
    ...payload,
    category,
    categoryIds: validCategoryIds
  });

  const profile = await prisma.vendorProfile.upsert({
    where: { userId: req.user.id },
    create: {
      userId: req.user.id,
      businessName: payload.businessName,
      description: payload.description,
      category,
      categoryIds: validCategoryIds,
      address: payload.address,
      city: payload.city,
      area: payload.area,
      phone: payload.phone,
      email: payload.email,
      website: payload.website,
      socialLinks: payload.socialLinks,
      openingHours: payload.openingHours,
      logoUrl: payload.logoUrl,
      primaryColor: payload.primaryColor,
      secondaryColor: payload.secondaryColor,
      accentColor: payload.accentColor,
      backgroundColor: payload.backgroundColor,
      latitude: payload.latitude,
      longitude: payload.longitude,
      isProfileCompleted: completed
    },
    update: {
      businessName: payload.businessName,
      description: payload.description,
      category,
      categoryIds: validCategoryIds,
      address: payload.address,
      city: payload.city,
      area: payload.area,
      phone: payload.phone,
      email: payload.email,
      website: payload.website,
      socialLinks: payload.socialLinks,
      openingHours: payload.openingHours,
      logoUrl: payload.logoUrl,
      primaryColor: payload.primaryColor,
      secondaryColor: payload.secondaryColor,
      accentColor: payload.accentColor,
      backgroundColor: payload.backgroundColor,
      latitude: payload.latitude,
      longitude: payload.longitude,
      isProfileCompleted: completed
    }
  });

  res.status(201).json(profile);
};

export const getVendorProfile = async (req: Request, res: Response): Promise<void> => {
  const profile = await prisma.vendorProfile.findUnique({
    where: { id: req.params.vendorId },
    include: {
      subscription: true
    }
  });

  if (!profile) {
    res.status(404).json({ message: "Vendor profile not found" });
    return;
  }

  res.json(profile);
};

export const updateVendorProfile = async (req: Request, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== Role.VENDOR) {
    res.status(403).json({ message: "Vendor account required" });
    return;
  }

  const vendor = await ensureVendorUser(req.user.id);
  if (!vendor || vendor.id !== req.params.vendorId) {
    res.status(404).json({ message: "Vendor profile not found" });
    return;
  }

  const payload = req.body;
  const categoryIds = payload.categoryIds ? dedupeIds(payload.categoryIds) : vendor.categoryIds;
  const validCategoryIds = await existingCategoryIds(categoryIds);
  if (categoryIds.length > 0 && validCategoryIds.length !== categoryIds.length) {
    res.status(400).json({ message: "One or more categoryIds are invalid" });
    return;
  }

  const merged = {
    businessName: payload.businessName ?? vendor.businessName,
    description: payload.description ?? vendor.description,
    category: payload.category ?? validCategoryIds[0] ?? vendor.category,
    categoryIds: validCategoryIds,
    address: payload.address ?? vendor.address,
    city: payload.city ?? vendor.city,
    phone: payload.phone ?? vendor.phone,
    email: payload.email ?? vendor.email,
    openingHours: payload.openingHours ?? vendor.openingHours,
    logoUrl: payload.logoUrl ?? vendor.logoUrl,
    primaryColor: payload.primaryColor ?? vendor.primaryColor,
    secondaryColor: payload.secondaryColor ?? vendor.secondaryColor,
    accentColor: payload.accentColor ?? vendor.accentColor,
    backgroundColor: payload.backgroundColor ?? vendor.backgroundColor
  };

  const profile = await prisma.vendorProfile.update({
    where: { id: vendor.id },
    data: {
      ...payload,
      category: payload.category ?? validCategoryIds[0] ?? vendor.category,
      categoryIds: validCategoryIds,
      isProfileCompleted: profileCompletionFromData(merged)
    }
  });

  res.json(profile);
};

export const uploadVendorLogo = async (req: Request, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== Role.VENDOR) {
    res.status(403).json({ message: "Vendor account required" });
    return;
  }

  const vendor = await ensureVendorUser(req.user.id);
  if (!vendor) {
    res.status(404).json({ message: "Vendor profile not found" });
    return;
  }

  const logoUrl =
    req.body.logoUrl ??
    `https://cdn.ticino-deals.example/vendor-logos/${vendor.id}-${Date.now()}.png`;

  const updated = await prisma.vendorProfile.update({
    where: { id: vendor.id },
    data: { logoUrl }
  });

  res.status(201).json({
    logoUrl: updated.logoUrl
  });
};

export const createVendorCategories = async (req: Request, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== Role.VENDOR) {
    res.status(403).json({ message: "Vendor account required" });
    return;
  }

  const vendor = await ensureVendorUser(req.user.id);
  if (!vendor) {
    res.status(404).json({ message: "Vendor profile not found" });
    return;
  }

  const categoryIds = dedupeIds(req.body.categoryIds);
  const validCategoryIds = await existingCategoryIds(categoryIds);
  if (validCategoryIds.length !== categoryIds.length) {
    res.status(400).json({ message: "One or more categoryIds are invalid" });
    return;
  }

  const updated = await prisma.vendorProfile.update({
    where: { id: vendor.id },
    data: {
      categoryIds: validCategoryIds,
      category: validCategoryIds[0] ?? vendor.category
    }
  });

  res.status(201).json({
    vendorId: updated.id,
    categoryIds: updated.categoryIds
  });
};

export const updateVendorCategories = async (req: Request, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== Role.VENDOR) {
    res.status(403).json({ message: "Vendor account required" });
    return;
  }

  const vendor = await ensureVendorUser(req.user.id);
  if (!vendor) {
    res.status(404).json({ message: "Vendor profile not found" });
    return;
  }

  const categoryIds = dedupeIds(req.body.categoryIds);
  const validCategoryIds = await existingCategoryIds(categoryIds);
  if (validCategoryIds.length !== categoryIds.length) {
    res.status(400).json({ message: "One or more categoryIds are invalid" });
    return;
  }

  const updated = await prisma.vendorProfile.update({
    where: { id: vendor.id },
    data: {
      categoryIds: validCategoryIds,
      category: validCategoryIds[0] ?? vendor.category
    }
  });

  res.json({
    vendorId: updated.id,
    categoryIds: updated.categoryIds
  });
};

export const getVendorDashboard = async (req: Request, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== Role.VENDOR) {
    res.status(403).json({ message: "Vendor account required" });
    return;
  }

  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: req.user.id },
    include: {
      offers: true,
      coupons: true,
      subscription: true
    }
  });

  if (!vendor) {
    res.status(404).json({ message: "Vendor profile not found" });
    return;
  }

  const activeSubscription = await hasActiveVendorSubscription(vendor.id);

  const stats = {
    offers: vendor.offers.length,
    activeOffers: vendor.offers.filter((offer) => offer.status === "APPROVED").length,
    views: vendor.offers.reduce((acc, offer) => acc + offer.viewsCount, 0),
    downloads: vendor.offers.reduce((acc, offer) => acc + offer.downloadsCount, 0),
    couponDownloads: vendor.coupons.reduce((acc, coupon) => acc + coupon.downloadCount, 0)
  };

  res.json({
    vendor: {
      id: vendor.id,
      businessName: vendor.businessName,
      city: vendor.city,
      logoUrl: vendor.logoUrl,
      categoryIds: vendor.categoryIds,
      branding: {
        primaryColor: vendor.primaryColor,
        secondaryColor: vendor.secondaryColor,
        accentColor: vendor.accentColor,
        backgroundColor: vendor.backgroundColor
      },
      profileCompleted: vendor.isProfileCompleted
    },
    subscription: vendor.subscription,
    activeSubscription,
    stats
  });
};
