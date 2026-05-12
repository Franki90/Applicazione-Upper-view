import { Router } from "express";
import { z } from "zod";
import {
  createOffer,
  deleteOffer,
  getOfferById,
  listOffers,
  publishOffer,
  updateOffer
} from "../controllers/offerController";
import { requireRole } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { Role } from "@prisma/client";

const offerBaseSchema = z.object({
  title: z.string().min(3),
  category: z.string().min(2).optional(),
  categoryIds: z.array(z.string().min(2)).min(1).optional(),
  description: z.string().min(10),
  includedItems: z.array(z.string().min(1)).min(1),
  terms: z.string().min(5),
  originalPrice: z.number().positive(),
  discountedPrice: z.number().nonnegative(),
  discountPercentage: z.number().min(0).max(100).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  location: z.string().min(2),
  city: z.string().min(2),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  imageUrls: z.array(z.string().url()).min(1),
  maxCouponDownloads: z.number().int().positive(),
  usageLimitPerCustomer: z.number().int().positive()
});

const offerCreateSchema = offerBaseSchema
  .refine((data) => data.categoryIds === undefined || data.categoryIds.length > 0, {
    message: "At least one category is required",
    path: ["categoryIds"]
  })
  .refine((data) => data.discountedPrice <= data.originalPrice, {
    message: "Discounted price must be lower than or equal to original price",
    path: ["discountedPrice"]
  });

const offerUpdateSchema = offerBaseSchema.partial().refine(
  (data) => {
    const hasValidDiscount =
      data.discountedPrice === undefined ||
      data.originalPrice === undefined ||
      data.discountedPrice <= data.originalPrice;
    const hasValidCategories = data.categoryIds === undefined || data.categoryIds.length > 0;
    return hasValidDiscount && hasValidCategories;
  },
  {
    message: "Invalid offer payload",
    path: ["categoryIds"]
  }
);

export const offerRouter = Router();

offerRouter.get("/", listOffers);
offerRouter.get("/:offerId", getOfferById);
offerRouter.post("/", requireRole([Role.VENDOR]), validateBody(offerCreateSchema), createOffer);
offerRouter.put("/:offerId", requireRole([Role.VENDOR]), validateBody(offerUpdateSchema), updateOffer);
offerRouter.patch("/:offerId", requireRole([Role.VENDOR]), validateBody(offerUpdateSchema), updateOffer);
offerRouter.delete("/:offerId", requireRole([Role.VENDOR]), deleteOffer);
offerRouter.post("/:offerId/publish", requireRole([Role.VENDOR]), publishOffer);
