import { Router } from "express";
import { listCategories } from "../controllers/categoryController";

export const categoryRouter = Router();

categoryRouter.get("/", listCategories);
