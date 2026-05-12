import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env";

export const signAccessToken = (payload: { userId: string; email: string; role: Role }): string => {
  return jwt.sign(
    {
      sub: payload.userId,
      email: payload.email,
      role: payload.role
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn
    }
  );
};
