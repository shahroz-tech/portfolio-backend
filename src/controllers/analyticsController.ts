import { Request, Response, NextFunction } from "express";
import Visitor from "../models/Visitor";
import PageView from "../models/PageView";
import { getClientIp, hashIp } from "../utils/hash";
import { parseUserAgent } from "../utils/ua";
import { resolveGeo } from "../utils/geo";

/**
 * POST /api/analytics/visit
 * Called once per new session on first page load.
 */
export const recordVisit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { visitorId, landingPage, referrer, language, screenSize } = req.body;

    if (!visitorId || !landingPage) {
      res.status(400).json({ success: false, message: "visitorId and landingPage are required." });
      return;
    }

    const ip = getClientIp(req);
    const ipHash = hashIp(ip);
    const { browser, os, device } = parseUserAgent(req.headers["user-agent"]);
    const geo = await resolveGeo(ip);

    const existing = await Visitor.findOne({ visitorId });
    if (existing) {
      res.json({ success: true, visitorId });
      return;
    }

    await Visitor.create({
      visitorId,
      ipHash,
      country: geo.country,
      city: geo.city,
      device,
      browser,
      os,
      referrer: referrer || "direct",
      landingPage,
      language,
      screenSize,
      pagesVisited: [landingPage],
    });

    res.status(201).json({ success: true, visitorId });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/analytics/pageview
 * Called on each client-side route change. Debounced/batched on the frontend.
 */
export const recordPageView = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { visitorId, path: viewedPath } = req.body;
    if (!visitorId || !viewedPath) {
      res.status(400).json({ success: false, message: "visitorId and path are required." });
      return;
    }

    await PageView.create({ visitorId, path: viewedPath });
    await Visitor.findOneAndUpdate(
      { visitorId },
      { $addToSet: { pagesVisited: viewedPath }, $set: { lastSeenAt: new Date() } }
    );

    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/analytics/session
 * Called on unload/beacon to record final session duration.
 */
export const recordSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { visitorId, durationSeconds } = req.body;
    if (!visitorId) {
      res.status(400).json({ success: false, message: "visitorId is required." });
      return;
    }

    await Visitor.findOneAndUpdate(
      { visitorId },
      { $set: { sessionDurationSeconds: Math.max(0, Number(durationSeconds) || 0), lastSeenAt: new Date() } }
    );

    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};
