import { Router } from "express";
import { z } from "zod";
import { getUserPreferences, saveUserPreferences } from "../controllers/userController";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";

const preferencesSchema = z.object({
  selectedCategoryIds: z.array(z.string().min(2)).max(20)
});

export const userRouter = Router();

userRouter.use(requireAuth);
userRouter.post("/preferences", validateBody(preferencesSchema), saveUserPreferences);
userRouter.get("/preferences", getUserPreferences);
