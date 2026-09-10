import { Router } from "express";
import { getResumeInfo, previewResume, downloadResume } from "../controllers/resumeController";

const router = Router();

router.get("/", getResumeInfo);
router.get("/preview", previewResume);
router.get("/download", downloadResume);
router.post("/download", downloadResume);

export default router;
