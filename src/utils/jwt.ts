import jwt from "jsonwebtoken";

export interface AdminTokenPayload {
  id: string;
  email: string;
  role: string;
}

export const signAdminToken = (payload: AdminTokenPayload): string => {
  const secret = process.env.JWT_SECRET as string;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return jwt.sign(payload, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any,
  });
};

export const verifyAdminToken = (token: string): AdminTokenPayload => {
  const secret = process.env.JWT_SECRET as string;
  return jwt.verify(token, secret) as AdminTokenPayload;
};
