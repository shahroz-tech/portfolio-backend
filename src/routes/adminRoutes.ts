import { Router } from "express";
import { requireAdminAuth } from "../middleware/auth";
import {
  getOverview,
  getVisitorsOverTime,
  getVisitorsList,
  getMessagesList,
  updateMessageStatus,
  deleteMessage,
  getSettings,
  updateSettings,
} from "../controllers/adminController";
import {
  getAllProjectsAdmin,
  createProject,
  updateProject,
  deleteProject,
  reorderProjects,
} from "../controllers/projectController";

const router = Router();

// Everything below requires a valid admin session.
router.use(requireAdminAuth);

router.get("/analytics/overview", getOverview);
router.get("/analytics/visitors-over-time", getVisitorsOverTime);

router.get("/visitors", getVisitorsList);

router.get("/messages", getMessagesList);
router.patch("/messages/:id/status", updateMessageStatus);
router.delete("/messages/:id", deleteMessage);

router.get("/projects", getAllProjectsAdmin);
router.post("/projects", createProject);
router.patch("/projects/reorder", reorderProjects);
router.put("/projects/:id", updateProject);
router.delete("/projects/:id", deleteProject);

router.get("/settings", getSettings);
router.put("/settings", updateSettings);

export default router;
