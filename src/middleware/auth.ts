import { Request, Response, NextFunction } from "express";
import { verifyAdminToken } from "../utils/jwt";
import Admin from "../models/Admin";

export interface AuthedRequest extends Request {
  admin?: { id: string; email: string; role: string };
}

export const requireAdminAuth = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cookieName = process.env.COOKIE_NAME || "portfolio_admin_token";
    const token =
      req.cookies?.[cookieName] ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : undefined);

    if (!token) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    const payload = verifyAdminToken(token);

    const admin = await Admin.findById(payload.id);
    if (!admin) {
      res.status(401).json({ success: false, message: "Session is no longer valid." });
      return;
    }

    req.admin = { id: admin.id, email: admin.email, role: admin.role };
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired session." });
  }
};
