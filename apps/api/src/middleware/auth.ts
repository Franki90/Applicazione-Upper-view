import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env";

export type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
};

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }
  next();
};

export const requireRole = (roles: Role[]) => (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  if (!roles.includes(req.user.role)) {
    res.status(403).json({ message: "Insufficient permissions" });
    return;
  }

  next();
};
