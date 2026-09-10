import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import xss from "xss";
import ContactMessage from "../models/ContactMessage";
import { sendContactNotification } from "../utils/email";
import { getClientIp, hashIp } from "../utils/hash";
import { ApiError } from "../middleware/errorHandler";

export const submitContactMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, errors.array()[0].msg as string);
    }

    const name = xss(String(req.body.name).trim());
    const email = xss(String(req.body.email).trim().toLowerCase());
    const subject = xss(String(req.body.subject).trim());
    const message = xss(String(req.body.message).trim());

    const ip = getClientIp(req);

    const doc = await ContactMessage.create({
      name,
      email,
      subject,
      message,
      ipHash: hashIp(ip),
      userAgent: req.headers["user-agent"],
      status: "new",
    });

    sendContactNotification({ name, email, subject, message }).catch((e) =>
      console.error("Failed to send contact notification email:", e.message)
    );

    res.status(201).json({
      success: true,
      message: "Thanks for reaching out — I'll get back to you soon.",
      id: doc.id,
    });
  } catch (err) {
    next(err);
  }
};
