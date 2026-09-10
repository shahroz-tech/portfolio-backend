import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import ResumeDownload from "../models/ResumeDownload";

const RESUME_DIR = path.join(__dirname, "..", "..", "storage", "resume");
const RESUME_FILENAME = "resume.pdf";

export const getResumeInfo = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const filePath = path.join(RESUME_DIR, RESUME_FILENAME);
    const exists = fs.existsSync(filePath);
    const stats = exists ? fs.statSync(filePath) : null;

    res.json({
      success: true,
      resume: {
        available: exists,
        fileName: "Muhammad_Shahroz_Shahzad_Resume.pdf",
        sizeBytes: stats?.size ?? null,
        updatedAt: stats?.mtime ?? null,
        previewUrl: "/api/resume/preview",
        downloadUrl: "/api/resume/download",
      },
    });
  } catch (err) {
    next(err);
  }
};

export const previewResume = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const filePath = path.join(RESUME_DIR, RESUME_FILENAME);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ success: false, message: "Resume file is not available." });
      return;
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=Muhammad_Shahroz_Shahzad_Resume.pdf");
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    next(err);
  }
};

export const downloadResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filePath = path.join(RESUME_DIR, RESUME_FILENAME);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ success: false, message: "Resume file is not available." });
      return;
    }

    await ResumeDownload.create({
      visitorId: (req.body?.visitorId as string) || (req.query.visitorId as string) || "unknown",
      referrer: req.headers.referer,
      device: req.headers["user-agent"],
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Muhammad_Shahroz_Shahzad_Resume.pdf"
    );
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    next(err);
  }
};
