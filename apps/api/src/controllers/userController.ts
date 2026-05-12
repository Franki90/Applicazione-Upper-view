import { Request, Response } from "express";
import { prisma } from "../config/db";

const dedupeIds = (ids: string[] | undefined): string[] => {
  if (!ids) return [];
  return Array.from(new Set(ids.filter(Boolean)));
};

const existingCategoryIds = async (ids: string[]): Promise<string[]> => {
  if (ids.length === 0) return [];
  const categories = await prisma.category.findMany({
    where: { id: { in: ids } },
    select: { id: true }
  });
  return categories.map((item) => item.id);
};

export const saveUserPreferences = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const selectedCategoryIds = dedupeIds(req.body.selectedCategoryIds);
  const validCategoryIds = await existingCategoryIds(selectedCategoryIds);
  if (validCategoryIds.length !== selectedCategoryIds.length) {
    res.status(400).json({ message: "One or more selectedCategoryIds are invalid" });
    return;
  }

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      selectedCategoryIds: validCategoryIds
    },
    select: {
      id: true,
      selectedCategoryIds: true
    }
  });

  res.status(201).json(user);
};

export const getUserPreferences = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      selectedCategoryIds: true
    }
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json(user);
};
