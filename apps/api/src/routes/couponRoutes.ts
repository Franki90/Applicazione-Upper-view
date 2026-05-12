import { Router } from "express";
import { z } from "zod";
import {
  downloadCoupon,
  generateCoupon,
  getCouponById,
  markCouponAsUsed,
  uploadCoupon
} from "../controllers/couponController";
import { requireAuth, requireRole } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { Role } from "@prisma/client";

const color = z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);

const couponDesignSchema = z.object({
  layout: z.enum(["CLASSIC", "MODERN", "PREMIUM", "YOUTHFUL", "MINIMAL"]).optional(),
  pattern: z
    .enum(["MINIMAL", "DOTS", "WAVES", "DIAGONAL_LINES", "CONFETTI", "GRADIENT", "GEOMETRIC"])
    .optional(),
  primaryColor: color.optional(),
  secondaryColor: color.optional(),
  textColor: color.optional(),
  backgroundColor: color.optional(),
  borderStyle: z.enum(["NONE", "SOLID", "DASHED", "DOUBLE", "BOLD"]).optional()
});

const couponBaseSchema = z
  .object({
    offerId: z.string().min(10),
    title: z.string().min(2).optional(),
    subtitle: z.string().min(2).optional(),
    couponCode: z.string().min(4).max(40).optional(),
    qrCodeUrl: z.string().url().optional(),
    couponImageUrl: z.string().url().optional(),
    couponPdfUrl: z.string().url().optional(),
    validityStart: z.string().datetime().optional(),
    validityEnd: z.string().datetime().optional(),
    terms: z.string().min(2).optional(),
    maxDownloads: z.number().int().positive().optional()
  })
  .merge(couponDesignSchema);

const generateCouponSchema = couponBaseSchema;
const uploadCouponSchema = couponBaseSchema.extend({
  uploadedFileUrl: z.string().url()
});

export const couponRouter = Router();

couponRouter.post("/generate", requireRole([Role.VENDOR]), validateBody(generateCouponSchema), generateCoupon);
couponRouter.post("/upload", requireRole([Role.VENDOR]), validateBody(uploadCouponSchema), uploadCoupon);
couponRouter.get("/:couponId", requireAuth, getCouponById);
couponRouter.post("/:couponId/download", requireRole([Role.CUSTOMER]), downloadCoupon);
couponRouter.post("/:couponId/mark-used", requireRole([Role.CUSTOMER]), markCouponAsUsed);
