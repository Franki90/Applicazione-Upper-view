import { Router } from "express";
import { z } from "zod";
import { adminAnalytics, listPendingOffers, moderateOffer } from "../controllers/adminController";
import { requireRole } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { OfferStatus, Role } from "@prisma/client";

const moderationSchema = z.object({
  status: z.nativeEnum(OfferStatus).refine(
    (status) => status === OfferStatus.APPROVED || status === OfferStatus.REJECTED,
    { message: "Status must be APPROVED or REJECTED" }
  )
});

export const adminRouter = Router();

adminRouter.use(requireRole([Role.ADMIN]));
adminRouter.get("/offers/pending", listPendingOffers);
adminRouter.patch("/offers/:id/moderate", validateBody(moderationSchema), moderateOffer);
adminRouter.get("/analytics", adminAnalytics);
