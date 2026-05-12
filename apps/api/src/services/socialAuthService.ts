import { OAuth2Client } from "google-auth-library";
import appleSigninAuth from "apple-signin-auth";
import { SocialProvider } from "@prisma/client";
import { env } from "../config/env";

const googleClient = new OAuth2Client();

export type SocialLoginInput = {
  provider: "google" | "apple";
  idToken: string;
};

export type SocialIdentity = {
  provider: SocialProvider;
  subject: string;
  email?: string;
  name?: string;
};

const mapProvider = (provider: "google" | "apple"): SocialProvider => {
  return provider === "google" ? SocialProvider.GOOGLE : SocialProvider.APPLE;
};

export const verifySocialIdentity = async (input: SocialLoginInput): Promise<SocialIdentity> => {
  if (input.provider === "google") {
    if (env.googleClientIds.length === 0) {
      throw new Error("GOOGLE_CLIENT_IDS is not configured");
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: input.idToken,
      audience: env.googleClientIds
    });

    const payload = ticket.getPayload();
    if (!payload?.sub) {
      throw new Error("Invalid Google token payload");
    }

    return {
      provider: mapProvider(input.provider),
      subject: payload.sub,
      email: payload.email,
      name: payload.name
    };
  }

  if (env.appleAudiences.length === 0) {
    throw new Error("APPLE_AUDIENCES is not configured");
  }

  const claims = await appleSigninAuth.verifyIdToken(input.idToken, {
    audience: env.appleAudiences,
    issuer: "https://appleid.apple.com",
    ignoreExpiration: false
  });

  if (!claims.sub) {
    throw new Error("Invalid Apple token payload");
  }

  const email = typeof claims.email === "string" ? claims.email : undefined;

  return {
    provider: mapProvider(input.provider),
    subject: claims.sub,
    email,
    name: email ? email.split("@")[0] : undefined
  };
};
