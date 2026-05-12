import { Router } from "express";
import { z } from "zod";
import { login, registerCustomer, registerVendor, socialLogin } from "../controllers/authController";
import { validateBody } from "../middleware/validate";

const registerCustomerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  selectedCategoryIds: z.array(z.string().min(2)).max(20).optional()
});

const registerVendorSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  businessName: z.string().min(2),
  city: z.string().min(2),
  latitude: z.number(),
  longitude: z.number(),
  categoryIds: z.array(z.string().min(2)).min(1).max(5)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const socialSchema = z.object({
  provider: z.enum(["google", "apple"]),
  idToken: z.string().min(20),
  email: z.string().email().optional(),
  name: z.string().min(2).optional(),
  requestedRole: z.enum(["CUSTOMER", "VENDOR"]).optional(),
  businessName: z.string().min(2).optional(),
  city: z.string().min(2).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  selectedCategoryIds: z.array(z.string().min(2)).max(20).optional(),
  categoryIds: z.array(z.string().min(2)).max(5).optional()
});

export const authRouter = Router();

authRouter.post("/register/customer", validateBody(registerCustomerSchema), registerCustomer);
authRouter.post("/register/vendor", validateBody(registerVendorSchema), registerVendor);
authRouter.post("/login", validateBody(loginSchema), login);
authRouter.post("/social", validateBody(socialSchema), socialLogin);
