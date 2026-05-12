import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { authRouter } from "./authRoutes";
import { offerRouter } from "./offerRoutes";
import { couponRouter } from "./couponRoutes";
import { subscriptionRouter } from "./subscriptionRoutes";
import { vendorRouter } from "./vendorRoutes";
import { adminRouter } from "./adminRoutes";
import { notificationRouter } from "./notificationRoutes";
import { categoryRouter } from "./categoryRoutes";
import { userRouter } from "./userRoutes";

export const apiRouter = Router();

apiRouter.use(authenticate);
apiRouter.use("/auth", authRouter);
apiRouter.use("/offers", offerRouter);
apiRouter.use("/coupons", couponRouter);
apiRouter.use("/subscriptions", subscriptionRouter);
apiRouter.use("/vendor", vendorRouter);
apiRouter.use("/vendors", vendorRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/notifications", notificationRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/users", userRouter);
