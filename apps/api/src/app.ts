import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env";
import { apiRouter } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { stripeWebhook } from "./controllers/subscriptionController";

export const app = express();

app.use(
  cors({
    origin: env.allowedOrigin === "*" ? true : env.allowedOrigin,
    credentials: true
  })
);
app.use(morgan("dev"));

// Stripe requires raw request body to validate webhook signatures.
app.post("/api/subscriptions/webhook", express.raw({ type: "application/json" }), stripeWebhook);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "ticino-marketplace-api" });
});

app.use("/api", apiRouter);
app.use(errorHandler);
