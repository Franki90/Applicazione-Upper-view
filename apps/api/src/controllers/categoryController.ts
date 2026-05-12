import { Request, Response } from "express";
import { prisma } from "../config/db";

export const listCategories = async (_req: Request, res: Response): Promise<void> => {
  const categories = await prisma.category.findMany({
    orderBy: { nameIt: "asc" }
  });

  res.json(categories);
};
