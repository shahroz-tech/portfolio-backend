import { Router } from "express";
import { recordVisit, recordPageView, recordSession } from "../controllers/analyticsController";
import { analyticsLimiter } from "../middleware/rateLimiters";

const router = Router();

router.use(analyticsLimiter);

router.post("/visit", recordVisit);
router.post("/pageview", recordPageView);
router.post("/session", recordSession);

export default router;
