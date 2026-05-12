import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Role, SocialProvider } from "@prisma/client";
import { prisma } from "../config/db";
import { signAccessToken } from "../utils/jwt";
import { verifySocialIdentity } from "../services/socialAuthService";

type AuthUserPayload = {
  id: string;
  email: string;
  name: string;
  role: Role;
  selectedCategoryIds?: string[];
};

const authPayload = (user: AuthUserPayload) => ({
  token: signAccessToken({ userId: user.id, email: user.email, role: user.role }),
  user
});

const toAuthUser = (user: AuthUserPayload): AuthUserPayload => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  selectedCategoryIds: user.selectedCategoryIds ?? []
});

const dedupeIds = (ids: string[] | undefined): string[] => {
  if (!ids) return [];
  return Array.from(new Set(ids.filter(Boolean)));
};

const validateCategoryIds = async (ids: string[]): Promise<string[]> => {
  if (ids.length === 0) return [];
  const categories = await prisma.category.findMany({
    where: { id: { in: ids } },
    select: { id: true }
  });
  return categories.map((item) => item.id);
};

export const registerCustomer = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, selectedCategoryIds: rawSelectedCategoryIds } = req.body;
  const selectedCategoryIds = dedupeIds(rawSelectedCategoryIds);
  const validCategoryIds = await validateCategoryIds(selectedCategoryIds);
  if (validCategoryIds.length !== selectedCategoryIds.length) {
    res.status(400).json({ message: "One or more selectedCategoryIds are invalid" });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ message: "Email already in use" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: Role.CUSTOMER,
      selectedCategoryIds: validCategoryIds
    },
    select: { id: true, email: true, name: true, role: true, selectedCategoryIds: true }
  });

  res.status(201).json(authPayload(toAuthUser(user)));
};

export const registerVendor = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, businessName, city, latitude, longitude, categoryIds: rawCategoryIds } =
    req.body;
  const categoryIds = dedupeIds(rawCategoryIds);
  const validCategoryIds = await validateCategoryIds(categoryIds);
  if (validCategoryIds.length !== categoryIds.length || validCategoryIds.length === 0) {
    res.status(400).json({ message: "One or more categoryIds are invalid" });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ message: "Email already in use" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: Role.VENDOR,
      vendorProfile: {
        create: {
          businessName,
          category: validCategoryIds[0] ?? null,
          categoryIds: validCategoryIds,
          city,
          latitude,
          longitude
        }
      }
    },
    select: { id: true, email: true, name: true, role: true, selectedCategoryIds: true }
  });

  res.status(201).json({
    ...authPayload(toAuthUser(user)),
    message: "Vendor account created. Activate subscription to publish offers."
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  res.json(
    authPayload(
      toAuthUser({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        selectedCategoryIds: user.selectedCategoryIds
      })
    )
  );
};

const mapRequestedRole = (value?: string): Role => {
  if (value === "VENDOR") return Role.VENDOR;
  return Role.CUSTOMER;
};

const socialProviderName = (provider: SocialProvider): string => {
  return provider === SocialProvider.GOOGLE ? "google" : "apple";
};

export const socialLogin = async (req: Request, res: Response): Promise<void> => {
  const {
    provider,
    idToken,
    email: fallbackEmail,
    name: fallbackName,
    requestedRole,
    businessName,
    city,
    latitude,
    longitude,
    selectedCategoryIds: rawSelectedCategoryIds,
    categoryIds: rawCategoryIds
  } = req.body;

  const selectedCategoryIds = dedupeIds(rawSelectedCategoryIds);
  const validSelectedCategoryIds = await validateCategoryIds(selectedCategoryIds);
  if (validSelectedCategoryIds.length !== selectedCategoryIds.length) {
    res.status(400).json({ message: "One or more selectedCategoryIds are invalid" });
    return;
  }

  const categoryIds = dedupeIds(rawCategoryIds);
  const validVendorCategoryIds = await validateCategoryIds(categoryIds);
  if (validVendorCategoryIds.length !== categoryIds.length) {
    res.status(400).json({ message: "One or more categoryIds are invalid" });
    return;
  }

  let identity: Awaited<ReturnType<typeof verifySocialIdentity>>;
  try {
    identity = await verifySocialIdentity({
      provider,
      idToken
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid social identity token" });
    return;
  }

  const email = identity.email ?? fallbackEmail;
  if (!email) {
    res.status(400).json({ message: "No email available from social provider" });
    return;
  }

  const normalizedRole = mapRequestedRole(requestedRole);
  if (normalizedRole === Role.VENDOR && validVendorCategoryIds.length === 0) {
    res.status(400).json({ message: "Vendor accounts require at least one categoryId" });
    return;
  }
  const displayName = fallbackName ?? identity.name ?? email.split("@")[0];

  let user = await prisma.user.findUnique({
    where: {
      provider_providerSubject: {
        provider: identity.provider,
        providerSubject: identity.subject
      }
    }
  });

  if (!user) {
    const existingByEmail = await prisma.user.findUnique({ where: { email } });

    if (existingByEmail) {
      user = await prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          provider: identity.provider,
          providerSubject: identity.subject,
          name: existingByEmail.name || displayName,
          selectedCategoryIds:
            normalizedRole === Role.CUSTOMER && validSelectedCategoryIds.length > 0
              ? validSelectedCategoryIds
              : existingByEmail.selectedCategoryIds
        }
      });
    } else {
      user = await prisma.user.create({
        data: {
          email,
          name: displayName,
          role: normalizedRole,
          selectedCategoryIds: normalizedRole === Role.CUSTOMER ? validSelectedCategoryIds : [],
          provider: identity.provider,
          providerSubject: identity.subject,
          passwordHash: null,
          vendorProfile:
            normalizedRole === Role.VENDOR
              ? {
                  create: {
                    businessName: businessName ?? displayName,
                    category: validVendorCategoryIds[0] ?? null,
                    categoryIds: validVendorCategoryIds,
                    city: city ?? "Lugano",
                    latitude: latitude ?? 46.0037,
                    longitude: longitude ?? 8.9511
                  }
                }
              : undefined
        }
      });
    }
  }

  res.json({
    ...authPayload(
      toAuthUser({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        selectedCategoryIds: user.selectedCategoryIds
      })
    ),
    provider: socialProviderName(identity.provider)
  });
};
