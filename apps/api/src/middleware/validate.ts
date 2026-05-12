import { NextFunction, Request, Response } from "express";
import { z, ZodTypeAny } from "zod";

export const validateBody = (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction): void => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: parsed.error.flatten()
    });
    return;
  }

  req.body = parsed.data;
  next();
};

export const validateQuery = (schema: z.ZodTypeAny) => (req: Request, res: Response, next: NextFunction): void => {
  const parsed = schema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({
      message: "Query validation failed",
      errors: parsed.error.flatten()
    });
    return;
  }

  req.query = parsed.data;
  next();
};
