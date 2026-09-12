import { Router } from "express";
import {
  getProjects,
  createProject,
} from "./projects.controller.js";
import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, authorize("ADMIN", "PROJECT_MANAGER"), getProjects);

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "PROJECT_MANAGER"),
  createProject
);

export default router;