import { Router } from "express";
import { getPublicProjects, getPublicProjectBySlug } from "../controllers/projectController";

const router = Router();

router.get("/", getPublicProjects);
router.get("/:slug", getPublicProjectBySlug);

export default router;
