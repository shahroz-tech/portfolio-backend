import { Router } from "express";
import { login, logout, me } from "../controllers/authController";
import { requireAdminAuth } from "../middleware/auth";
import { adminLoginLimiter } from "../middleware/rateLimiters";

const router = Router();

router.post("/login", adminLoginLimiter, login);
router.post("/logout", requireAdminAuth, logout);
router.get("/me", requireAdminAuth, me);

export default router;
