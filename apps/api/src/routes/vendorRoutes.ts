import { Router } from "express";
import { z } from "zod";
import { Role } from "@prisma/client";
import { requireRole } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import {
  createVendorProfile,
  createVendorCategories,
  getVendorDashboard,
  getVendorProfile,
  updateVendorCategories,
  updateVendorProfile,
  uploadVendorLogo
} from "../controllers/vendorController";

const color = z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);

const vendorProfileSchema = z.object({
  businessName: z.string().min(2),
  description: z.string().min(10),
  category: z.string().min(2).optional(),
  categoryIds: z.array(z.string().min(2)).min(1).max(5),
  address: z.string().min(2),
  city: z.string().min(2),
  area: z.string().optional(),
  phone: z.string().min(6),
  email: z.string().email(),
  website: z.string().url().optional(),
  socialLinks: z.record(z.string()).optional(),
  openingHours: z.record(z.string()).optional(),
  logoUrl: z.string().url().optional(),
  primaryColor: color.default("#4F46E5"),
  secondaryColor: color.default("#22C55E"),
  accentColor: color.default("#06B6D4"),
  backgroundColor: color.default("#F9FAFB"),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

const vendorProfileUpdateSchema = vendorProfileSchema.partial();

const logoUploadSchema = z.object({
  logoUrl: z.string().url().optional()
});

const categoriesSchema = z.object({
  categoryIds: z.array(z.string().min(2)).min(1).max(5)
});

export const vendorRouter = Router();

vendorRouter.get("/dashboard", requireRole([Role.VENDOR]), getVendorDashboard);
vendorRouter.post("/profile", requireRole([Role.VENDOR]), validateBody(vendorProfileSchema), createVendorProfile);
vendorRouter.get("/profile/:vendorId", getVendorProfile);
vendorRouter.put("/profile/:vendorId", requireRole([Role.VENDOR]), validateBody(vendorProfileUpdateSchema), updateVendorProfile);
vendorRouter.post("/logo-upload", requireRole([Role.VENDOR]), validateBody(logoUploadSchema), uploadVendorLogo);
vendorRouter.post("/categories", requireRole([Role.VENDOR]), validateBody(categoriesSchema), createVendorCategories);
vendorRouter.put("/categories", requireRole([Role.VENDOR]), validateBody(categoriesSchema), updateVendorCategories);
