import { Request, Response, NextFunction } from "express";
import Project from "../models/Project";
import { ApiError } from "../middleware/errorHandler";

export const getPublicProjects = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await Project.find({ published: true }).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, projects });
  } catch (err) {
    next(err);
  }
};

export const getPublicProjectBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug, published: true });
    if (!project) throw new ApiError(404, "Project not found.");
    res.json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

// --- Admin ---

export const getAllProjectsAdmin = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, projects });
  } catch (err) {
    next(err);
  }
};

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!project) throw new ApiError(404, "Project not found.");
    res.json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) throw new ApiError(404, "Project not found.");
    res.json({ success: true, message: "Project deleted." });
  } catch (err) {
    next(err);
  }
};

export const reorderProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { order } = req.body as { order: { id: string; order: number }[] };
    await Promise.all(
      order.map((item) => Project.findByIdAndUpdate(item.id, { order: item.order }))
    );
    res.json({ success: true, message: "Project order updated." });
  } catch (err) {
    next(err);
  }
};
