import crypto from "crypto";

/**
 * IP addresses are never stored in plaintext. We store a salted hash so
 * repeat-visitor detection and abuse/rate-limiting are still possible
 * without retaining a reversible personal identifier.
 */
export const hashIp = (ip: string): string => {
  const salt = process.env.IP_HASH_SALT || "fallback-salt-change-me";
  return crypto.createHash("sha256").update(`${ip}:${salt}`).digest("hex");
};

export const getClientIp = (req: { headers: any; socket: any; ip?: string }): string => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "0.0.0.0";
};
