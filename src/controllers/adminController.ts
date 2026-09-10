import { Request, Response, NextFunction } from "express";
import Visitor from "../models/Visitor";
import PageView from "../models/PageView";
import ContactMessage from "../models/ContactMessage";
import ResumeDownload from "../models/ResumeDownload";
import SiteSettings from "../models/SiteSettings";
import { ApiError } from "../middleware/errorHandler";

const startOf = (unit: "day" | "week" | "month"): Date => {
  const now = new Date();
  if (unit === "day") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (unit === "week") {
    const d = new Date(now);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    return new Date(d.getFullYear(), d.getMonth(), diff);
  }
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

export const getOverview = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalVisitors, visitorsToday, visitorsThisWeek, visitorsThisMonth] = await Promise.all([
      Visitor.countDocuments(),
      Visitor.countDocuments({ createdAt: { $gte: startOf("day") } }),
      Visitor.countDocuments({ createdAt: { $gte: startOf("week") } }),
      Visitor.countDocuments({ createdAt: { $gte: startOf("month") } }),
    ]);

    const [totalMessages, newMessages] = await Promise.all([
      ContactMessage.countDocuments(),
      ContactMessage.countDocuments({ status: "new" }),
    ]);

    const resumeDownloads = await ResumeDownload.countDocuments();

    const popularPages = await PageView.aggregate([
      { $group: { _id: "$path", views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 8 },
    ]);

    const trafficSources = await Visitor.aggregate([
      { $group: { _id: { $ifNull: ["$referrer", "direct"] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    const deviceBreakdown = await Visitor.aggregate([
      { $group: { _id: "$device", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const browserBreakdown = await Visitor.aggregate([
      { $group: { _id: "$browser", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    const recentVisitors = await Visitor.find().sort({ createdAt: -1 }).limit(10);
    const recentMessages = await ContactMessage.find().sort({ createdAt: -1 }).limit(10);

    res.json({
      success: true,
      overview: {
        totalVisitors,
        visitorsToday,
        visitorsThisWeek,
        visitorsThisMonth,
        totalMessages,
        newMessages,
        resumeDownloads,
        popularPages,
        trafficSources,
        deviceBreakdown,
        browserBreakdown,
        recentVisitors,
        recentMessages,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getVisitorsOverTime = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = Math.min(90, Number(req.query.days) || 30);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const data = await Visitor.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getVisitorsList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const { search, country, device, from, to, sortBy = "createdAt", sortDir = "desc" } = req.query;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { visitorId: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
      ];
    }
    if (country) filter.country = country;
    if (device) filter.device = device;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(String(from));
      if (to) filter.createdAt.$lte = new Date(String(to));
    }

    const sort: any = { [String(sortBy)]: sortDir === "asc" ? 1 : -1 };

    const [visitors, total] = await Promise.all([
      Visitor.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit),
      Visitor.countDocuments(filter),
    ]);

    res.json({
      success: true,
      visitors,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

export const getMessagesList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const { search, status, sortBy = "createdAt", sortDir = "desc" } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    const sort: any = { [String(sortBy)]: sortDir === "asc" ? 1 : -1 };

    const [messages, total] = await Promise.all([
      ContactMessage.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit),
      ContactMessage.countDocuments(filter),
    ]);

    res.json({
      success: true,
      messages,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

export const updateMessageStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const allowed = ["new", "read", "replied", "archived"];
    if (!allowed.includes(status)) throw new ApiError(400, "Invalid status.");

    const message = await ContactMessage.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!message) throw new ApiError(404, "Message not found.");

    res.json({ success: true, message });
  } catch (err) {
    next(err);
  }
};

export const deleteMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) throw new ApiError(404, "Message not found.");
    res.json({ success: true, message: "Message deleted." });
  } catch (err) {
    next(err);
  }
};

export const getSettings = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({
        notificationEmail: process.env.NOTIFY_EMAIL || "",
      });
    }
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings({ notificationEmail: process.env.NOTIFY_EMAIL || "" });
    }

    const allowedFields = [
      "notificationEmail",
      "analyticsEnabled",
      "contactFormEnabled",
      "siteTitle",
      "siteDescription",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        (settings as any)[field] = req.body[field];
      }
    });

    await settings.save();
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};
