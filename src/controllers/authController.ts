import { Request, Response, NextFunction } from "express";
import Admin from "../models/Admin";
import { signAdminToken } from "../utils/jwt";
import { ApiError } from "../middleware/errorHandler";
import { AuthedRequest } from "../middleware/auth";

const LOCK_THRESHOLD = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, "Email and password are required.");
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!admin) {
      throw new ApiError(401, "Invalid credentials.");
    }

    if (admin.isLocked()) {
      throw new ApiError(423, "Account temporarily locked due to repeated failed attempts. Try again later.");
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      admin.loginAttempts += 1;
      if (admin.loginAttempts >= LOCK_THRESHOLD) {
        admin.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
      }
      await admin.save();
      throw new ApiError(401, "Invalid credentials.");
    }

    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    admin.lastLoginAt = new Date();
    await admin.save();

    const token = signAdminToken({ id: admin.id, email: admin.email, role: admin.role });

    res.cookie(process.env.COOKIE_NAME || "portfolio_admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Logged in successfully.",
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie(process.env.COOKIE_NAME || "portfolio_admin_token");
  res.json({ success: true, message: "Logged out." });
};

export const me = async (req: AuthedRequest, res: Response) => {
  res.json({ success: true, admin: req.admin });
};
